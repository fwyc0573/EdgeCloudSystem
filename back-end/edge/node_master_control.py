import contextlib
import csv
import json
import multiprocessing
import os
import pickle
import random
import re
import socket
import subprocess
import time
from collections import defaultdict
from dataclasses import dataclass
from multiprocessing import Lock, Manager, Pool, Value
from multiprocessing.managers import SyncManager
from typing import List
import requests
import numpy as np
from deploy import delete, deploy
from kubernetes import client, watch, config

from check_pod import (
    Pod,
    check_pod,
    check_pod_not_running,
    check_pods_num_for_this_edge_cluster,
    check_pods_of_the_type_on_this_node,
    check_running_pod_for_all_name,
    get_resource_dataframe,
)
from checkstatus import get_nodes_name, nodes

"""
定义ip和端口
"""
# 云集群master的IP
CLOUD_IP = "192.168.1.35"
# 边缘集群master收集任务发送器的任务的port
EDGE_MASTER_RECEIVE_REQUEST_PORT = 9000
# 云集群master收集tasks执行情况的port
CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT = 9001
# 发到云上决定
CLOUD_MASTER_RECEIVE_REQUEST_PORT = 9002
# 请求更新
CLOUD_MASTER_RECEIVE_UPDATE = 9003
# 上一次编排至今各个节点中各类型请求成功与失败数量
TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT = 9004
# 目前的各个节点的服务部署种类与数量
CURRENT_SERVICE_ON_EACH_NODE_PORT = 9005
# 各节点积压的任务种类与数量
STUCK_TASKS_SITUATION_ON_EACH_NODE_PORT = 9006
# 各节点内存、CPU使用情况
RESOURCE_ON_EACH_NODE_PORT = 9007
# 收到云上执行的情况
EDGE_MASTER_RECEIVE_RESULT_PORT = 9009
# update设定何时更新
UPDATE = 10
# 服务种类
SERVICE_TYPE_NUM = 20

PORT = [
    "5001",
    "5002",
    "5003",
    "5004",
    "5005",
    "5006",
    "5007",
    "5008",
    "5009",
    "5010",
    "5011",
    "5012",
    "5013",
    "5014",
    "5015",
    "5016",
    "5017",
    "5018",
    "5019",
    "5020",
]
off_load_algorithm_name = [
    "random-node-offload",
    "random-pod-offload",
    "dqn-node-offload",
]
off_load_algorithm_port = [4000, 4001, 4002]


def fetch_edge_master_name(use_cache=True):
    nodes_list = get_resource_dataframe("node", use_cache=use_cache)
    master_name = nodes_list[nodes_list["ROLES"] == "master"]["NAME"].iloc[0]
    return master_name


def send_task_json(client, result):
    result = json.dumps(result)
    task = bytes(result.encode("utf-8"))
    task_len = len(task)
    task_len = task_len.to_bytes(8, byteorder="big")
    client.sendall(task_len)
    client.sendall(task)


def return_current_pod_situation_for_csv(node_name: str, pod_info: dict):
    service_type = [0] * SERVICE_TYPE_NUM
    for pod in pod_info:
        this_pod_name = pod["node"]
        if node_name == re.findall(r"\d+$", this_pod_name)[0]:
            pod_name = pod["name"]
            this_service_name = re.match(r"^(.*?)-deployment", pod_name).group(1)
            this_service_type = int(re.findall(r"\d+\.?\d*", this_service_name)[0])
            service_type[this_service_type - 1] += 1
    return service_type


def return_tasks_execute_situation(execute_dict: dict):
    success_execute_situation = [0] * SERVICE_TYPE_NUM
    failure_execute_situation = [0] * SERVICE_TYPE_NUM
    for type in execute_dict:
        value = execute_dict[type]
        success_execute_situation[int(type) - 1] = value["success"] / (
            value["success"] + value["failure"]
        )
        failure_execute_situation[int(type) - 1] = value["failure"] / (
            value["success"] + value["failure"]
        )
    return success_execute_situation, failure_execute_situation


"""
    只需要在启动local_run之前把对应的pod标为正在使用，在local_run使用完那个pod后把其标记为空闲就行了
    
    最开始用一次，如果不能知道新加的pod名字叫什么那就在加之后用一次以将新加的pod补充到之前维护的标记集合中
    
    注意hashtable的len可能大于这个值，因为你删除一个正在运行的pod时是将其标记为即将删除，同时在这个表里把值减去1，但并没有真的把它从hashtable中删除
    如果算法又说要增加这种类型的pod，你可以优先将标记为即将删除的pod的标签改为正在运行，这样就不用真的加减pod了
    如果没有增加，local_run用完这个pod后就把这个pod删了
    如果这个pod没被标记为删除，local_run用完这个pod后将其标记为空闲
    如果算法要你删除，你应该优先在空闲的pod中寻找，如果找到了就直接删，如果没有空闲的，就把一个正在运行的pod标记为即将删除，删除它的工作会在对应的local_run函数的最后完成
    如果算法要你添加，你应该优先在即将删除的pod中寻找，如果找到了就把标记改为运行中，如果找不到就真的添加一个
    运行local_run之前，你尝试分配给它一个空闲的pod，将这个pod标记为运行中，如果没有空闲的pod则失败
    local_run的末尾，你检查当前pod的状态，如果是即将删除就把pod删掉，如果是运行中就把它改为空闲
    标记一共就这几种：空闲0、运行中1、未初始化
    
我没有加即将删除的标记
只是减了len
当一个任务完成时会优先删掉
"""


def update_delete(
    num: int,
    epoch_index: int,
    not_running_pod_info: list,
    running_pod_info: list,
    all_pod_info: list,
    return_result: dict,
):
    if len(all_pod_info) < num:
        raise Exception("there is no enough pod(s) to delete")

    # 还没running的本类型的
    while num > 0 and len(not_running_pod_info):
        num -= 1
        pod = not_running_pod_info.pop()
        pod_name = pod["name"]
        # service_name = re.match(r'^(.*?)-deployment', pod_name).group(1)
        # node_name = check_pod_for_its_node(pod_name, service_name, True, 0)
        # node_name = re.findall(r'\d+$', node_name)[0]
        delete(pod_name)

    while num > 0 and len(running_pod_info):
        num -= 1
        pod = running_pod_info.pop()
        pod_name = pod["name"]
        # service_name = re.match(r'^(.*?)-deployment', pod_name).group(1)
        # node_name = check_pod_for_its_node(pod_name, service_name, True, 0)
        # node_name = re.findall(r'\d+$', node_name)[0]
        delete(pod_name)


# 如果算法又说要增加这种类型的pod，可以优先将标记为即将删除的pod的标签改为正在运行，这样就不用真的加减pod了
def update_add(type: int, pod_name_index, pod_name_index_lock):
    with pod_name_index_lock:
        new_name = f"service{type}-deployment{pod_name_index.value}"
        pod_name_index_val = pod_name_index.value + 1
        pod_name_index.value = pod_name_index_val
    service_name = f"service{type}"
    if_deploy = deploy("./service/service" + str(type) + "/service.yaml", new_name)
    # node_name = '<none>'
    # while node_name == '<none>':
    #     node_name = check_pod_for_its_node(new_name, service_name, True, 0)
    #     time.sleep(100)


def nodes_delay():
    config.load_kube_config()
    v1 = client.CoreV1Api()
    ready_nodes = []
    delay = {}
    master_name = ""
    for n in v1.list_node().items:
        if "master" in n.metadata.name:
            pass
        else:
            for status in n.status.conditions:
                if status.status == "True" and status.type == "Ready":
                    ip = n.status.addresses[0].address
                    ready_nodes.append(n)
                    delay[n.metadata.name] = ping(ip, 3, 1000)
                else:
                    pass
    if len(ready_nodes) == 0:
        return -1
    else:
        return delay


# 取队列里的request本地执行
# 输入：可用pod列表， 选中pod的序号， 请求
# 输出：请求处理结果
# 作用：处理请求
# multiprocessing.sharedctypes._Value类型标注
# 为了pylance提供的静态类型检查
#
def local_run(
    index: int,
    current_pod: Pod,
    req: list,
    update_index,
    update_index_lock,
    arrive_from_center_to_edge_time: float,
    trans_from_center_to_edge: float,
    algorithm_type: int,
    local_offload_epoch_returned_by_func: int,
    pod_name_index,
    pod_name_index_lock,
):
    try:
        print("local run", flush=True)
        service_type, _, _, time_limit, *_ = req

        def run_once(command):
            return os.popen(command).read()

        def run(command, keyword):
            result = run_once(command)
            if keyword is not None:
                initial_time = 0
                while result.find(keyword) == -1 and initial_time < 23:
                    result = run_once(command)
                    initial_time += 1
            return result

        master_name = fetch_edge_master_name()
        if current_pod is None:
            # 根本没有这个pod，时间花费为-1（标志）
            runtime = -1
            if_success = 0

            flow = {"from": master_name, "to": "", "str": "no pod"}

            mission = {"success": 0, "failure": 1, "stuck": 0}
            detail_mission = {
                "name": flow["from"],
                "type": service_type,
                "success": 0,
                "failure": 1,
            }

        else:
            if service_type not in range(1, SERVICE_TYPE_NUM + 1):
                raise Exception("undefined request type")
            pod_node_list = []
            for i in pod_list:
                pod_node_list.append(i.node)
            node_delay = nodes_delay()

            # offloading decision based on containerization algorithm
            observation = json.dumps([pod_node_list, node_delay])
            alg_pod = PORT[service_type - 1]
            alg_ip = alg_pod.ip
            pod_index = requests.post(
                "http://" + alg_ip + ":" + alg_pod + "/predict", data=observation
            )

            flow = {"from": master_name, "to": current_pod.name, "str": pod_index}
            # 计算时间
            end = time.time()
            ###########################要改时间
            runtime = (
                end - arrive_from_center_to_edge_time + trans_from_center_to_edge * 2
            )  # 其实这个时间是发送时间，应该最终答案传给datacenter

            print(f"task #{index}, type {service_type} ends:", flow, flush=True)

            mission = {"success": 0, "failure": 0, "stuck": 0}
            detail_mission = {
                "name": flow["from"],
                "type": service_type,
                "success": 0,
                "failure": 0,
            }

            if_success = 0
            if runtime <= time_limit:
                mission["success"] += 1
                detail_mission["success"] += 1
                if_success = 1
            else:
                mission["failure"] += 1
                detail_mission["failure"] += 1

        arguments = [
            local_offload_epoch_returned_by_func,
            service_type,
            if_success,
            runtime,
        ]
        offload_algorithm_pod = check_pod(
            off_load_algorithm_name[algorithm_type], True, True, 2, use_cache=False
        )[0]
        run(
            f"curl http://{offload_algorithm_pod.ip}:{off_load_algorithm_port[algorithm_type]}/feedback -X POST -d 'observation={json.dumps(arguments)}'",
            None,
        )
        print("local_run上传结果数据")

        print(mission, flush=True)
        print(detail_mission, flush=True)
        client1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client1.connect((CLOUD_IP, CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT))
        send_task_json(client1, mission)
        client1.close()
        client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client2.connect((CLOUD_IP, TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT))
        with update_index_lock:
            update_index_val = update_index.value + 1
            update_index.value = update_index_val
            if update_index_val % UPDATE == 0:
                send_task_json(client2, [detail_mission, 1])
                return_result_len = client2.recv(8)
                return_result_len = int.from_bytes(return_result_len, byteorder="big")
                return_result = client2.recv(return_result_len)
                client2.close()
                return_result = json.loads(return_result.decode("utf-8"))
                update_service(return_result, pod_name_index, pod_name_index_lock)
            else:
                send_task_json(client2, [detail_mission, 0])
                client2.close()
        return flow
    except:
        import traceback

        traceback.print_exc()


# 输入：无
# 输出：运行时间
# 作用：重新编排服务


def update_pod(current_resource_of_nodes, pod_info):
    start = time.time()

    # 发送已经有的服务
    this_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    this_client.setblocking(True)
    this_client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    this_client.connect((CLOUD_IP, CURRENT_SERVICE_ON_EACH_NODE_PORT))
    master_name = fetch_edge_master_name()
    send_task_json(this_client, [master_name, pod_info, 0])
    this_client.close()

    # 发送node上的资源
    this_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    this_client.setblocking(True)
    this_client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    this_client.connect((CLOUD_IP, RESOURCE_ON_EACH_NODE_PORT))
    memory_resource = current_resource_of_nodes
    send_task_json(this_client, memory_resource)
    this_client.close()

    return start


# 编排服务
def update_control(
    current_resource_of_nodes,
    return_result,
    current_update,
    pod_name_index,
    pod_name_index_lock,
):
    print("··········································update开始了")
    running_pod_info = []
    update_pod_info = []
    not_running_pod_info = []
    all_pod_info = []
    # 用于刷新缓存
    get_resource_dataframe("pod", use_cache=False)
    for service_type in range(1, SERVICE_TYPE_NUM + 1):
        temp = []
        pods_list = check_pod(
            "service" + str(service_type), True, True, 0, use_cache=True
        )
        for pod in pods_list:
            temp.append(pod.__dict__)
            update_pod_info.append(pod.__dict__)
        running_pod_info.append(temp)

        temp = []
        pods_list = check_pod_not_running(
            "service" + str(service_type), True, 0, use_cache=True
        )
        for pod in pods_list:
            temp.append(pod.__dict__)
        not_running_pod_info.append(temp)

        temp = []
        pods_list = check_pod(
            "service" + str(service_type), False, True, 0, use_cache=True
        )
        for pod in pods_list:
            temp.append(pod.__dict__)
        all_pod_info.append(temp)

    start = update_pod(current_resource_of_nodes, update_pod_info)
    this_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    this_client.connect((CLOUD_IP, CLOUD_MASTER_RECEIVE_UPDATE))
    # 先发一个master_name过去作为update标志
    master_name = fetch_edge_master_name()
    pre = [master_name, current_update]
    send_task_json(this_client, pre)
    # 格式为数组 [+/-type]
    result_len = this_client.recv(8)
    result_len = int.from_bytes(result_len, byteorder="big")
    result = this_client.recv(result_len)
    result = json.loads(result.decode("utf-8"))
    print("收到更新的result是：")
    print(result)
    this_client.close()
    epoch_index = result[0]
    result = result[1][1:]
    changes = defaultdict(int)
    for pod_type in result:
        if pod_type == 0:
            continue
        if pod_type > 0:
            changes[pod_type] += 1
        else:
            changes[-pod_type] -= 1
    # 尽量先删后加
    add_tasks = []
    for type, num in changes.items():
        if type == 0:
            print("do nothing")
            continue
        pods_list = all_pod_info[type - 1]
        if num > 0:
            add_tasks.append((type, pods_list))  # 只加一个？？？
        else:
            num = -num
            if len(pods_list) < num:
                print("decision is wrong")
                num = len(pods_list)
            update_delete(
                num,
                epoch_index,
                not_running_pod_info[type - 1],
                running_pod_info[type - 1],
                all_pod_info[type - 1],
                return_result,
            )
    for type, pods_list in add_tasks:
        update_add(type, pod_name_index, pod_name_index_lock)
    end = time.time()
    runtime = end - start
    print("Updating pods consumes time:", runtime, "\n")


def receive_result_from_cloud(
    update_index,
    update_index_lock,
    offload_algorithm_type,
    pod_name_index,
    pod_name_index_lock,
):
    def run_once(command):
        return os.popen(command).read()

    def run(command, keyword):
        result = json.loads(run_once(command))
        if keyword is None:
            return result
        else:
            initial_time = 0
            while result[0] != keyword and initial_time < 23:
                result = json.loads(run_once(command))
                initial_time += 1
            return result[1]

    print("·················监听云执行情况端口开启")
    receive_result_from_cloud_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    receive_result_from_cloud_server.setblocking(True)
    receive_result_from_cloud_server.setsockopt(
        socket.SOL_SOCKET, socket.SO_REUSEADDR, 1
    )
    receive_result_from_cloud_server.bind(("0.0.0.0", EDGE_MASTER_RECEIVE_RESULT_PORT))
    receive_result_from_cloud_server.listen()

    while True:
        s, address = receive_result_from_cloud_server.accept()
        result_len = s.recv(8)
        result_len = int.from_bytes(result_len, byteorder="big")
        result = s.recv(result_len)
        result = json.loads(result.decode("utf-8"))

        # offload_epoch_index,执行成功情况, 实际执行时间
        arguments = [result[0], result[3], result[2], result[1]]
        offload_algorithm_pod = check_pod(
            off_load_algorithm_name[offload_algorithm_type],
            True,
            True,
            2,
            use_cache=False,
        )[0]

        # 这里应该为offload加一个返回情况！！！！！！！！！！！
        run(
            f"curl http://{offload_algorithm_pod.ip}:{off_load_algorithm_port[offload_algorithm_type]}/feedback -X POST -d 'observation={json.dumps(arguments)}'",
            None,
        )
        print("cloud_receive里上传数据")
        s.close()

        with update_index_lock:
            update_index_val = update_index.value + 1
            update_index.value = update_index_val
            if update_index_val % UPDATE == 0:
                client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                client2.connect((CLOUD_IP, TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT))
                send_task_json(client2, [{}, 1])
                return_result_len = client2.recv(8)
                return_result_len = int.from_bytes(return_result_len, byteorder="big")
                return_result = client2.recv(return_result_len)
                client2.close()
                return_result = json.loads(return_result.decode("utf-8"))
                update_service(return_result, pod_name_index, pod_name_index_lock)


def update_service(return_result, pod_name_index, pod_name_index_lock):
    print(return_result)
    current_resource_of_nodes = nodes()
    print(current_resource_of_nodes)
    update_control(
        current_resource_of_nodes,
        return_result,
        UPDATE,
        pod_name_index,
        pod_name_index_lock,
    )


def offload_service(
    algorithm_type, req_type, offload_epoch_index, offload_epoch_index_lock
):
    def run_once(command):
        return os.popen(command).read()

    def run(command, keyword):
        result = json.loads(run_once(command))
        if keyword is None:
            return result
        else:
            initial_time = 0
            while result[0] != keyword and initial_time < 23:
                result = json.loads(run_once(command))
                initial_time += 1
            return result[1]

    # 收集信息
    # nodes_resource = {'cpu':[边缘node的cpu（按顺序）]，'mem':[边缘node的mem（按顺序）],'up_time':[边缘node的up_time（按顺序）],
    # 'pod':[边缘，云（按顺序）]}
    nodes_resource = {"cpu": [], "mem": [], "up_time": [], "pod": []}
    nodes_name = get_nodes_name()
    # 已经按顺序排好
    for node_name in nodes_name:
        resource_deploy_name = node_name + "-resource"
        pod_ip = check_pod(resource_deploy_name, True, True, 1, use_cache=True)[
            0
        ].ip  # 由主进程调用，此时主进程已经刷新了缓存
        # 是否需要-d?
        # 定的是7000端口返回资源，get请求

        # 返回:[[cpu],[mem],[up_time]]
        # []中按照顺序依次是需要的几项
        resource = run(f"curl http://{pod_ip}:7000/resource", None)
        nodes_resource["cpu"].extend(resource[0])
        nodes_resource["mem"].extend(resource[1])
        nodes_resource["up_time"].extend(resource[2])

    # 收集pod
    pods_on_edge = check_pods_num_for_this_edge_cluster(True, 0, use_cache=True)
    pods_on_cloud = np.full(SERVICE_TYPE_NUM, 3).tolist()
    nodes_resource["pod"].extend(pods_on_edge)
    nodes_resource["pod"].extend(pods_on_cloud)

    offload_algorithm_pod = check_pod(
        off_load_algorithm_name[algorithm_type], True, True, 2, use_cache=True
    )[0]

    with offload_epoch_index_lock:  # 这个锁有必要吗？
        offload_epoch_index.value += 1

        if offload_epoch_index.value == 1:
            # 加上上一个成功与否（1/0)和执行时间!!!!!!!!!!!!!!!!!!!
            arguments = [
                offload_epoch_index.value,
                0,
                req_type + 1,
                req_type,
                nodes_resource,
            ]
        else:
            arguments = [offload_epoch_index.value, -1, -1, req_type, nodes_resource]
    # 如果上面的锁有必要，那么这里可能会乱序发送
    result = run(
        f"curl http://{offload_algorithm_pod.ip}:{off_load_algorithm_port[algorithm_type]}/predict -X POST -d 'observation={json.dumps(arguments)}'",
        "result",
    )
    print(result)
    return result, arguments[0]


if __name__ == "__main__":
    print("edge master start")
    # 从数据中心收集request
    local_task_count = 0
    with Manager() as manager:
        assert isinstance(manager, SyncManager)

        update_index = manager.Value("d", 0)
        update_index_lock = manager.Lock()
        offload_epoch_index = manager.Value("d", 0)
        offload_epoch_index_lock = manager.Lock()
        pod_name_index = manager.Value("d", 0)
        pod_name_index_lock = manager.Lock()

        # 这里增加offload算法，0为random_node，1为random_pod,2为强化学习
        offload_algorithm_index = 2

        p1 = multiprocessing.Process(
            target=receive_result_from_cloud,
            args=(
                update_index,
                update_index_lock,
                offload_algorithm_index,
                pod_name_index,
                pod_name_index_lock,
            ),
        )
        p1.start()

        print("·················receive主进程开始")
        edge_master_receive_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        edge_master_receive_server.setblocking(True)
        edge_master_receive_server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        edge_master_receive_server.bind(("0.0.0.0", EDGE_MASTER_RECEIVE_REQUEST_PORT))
        edge_master_receive_server.listen()

        with Pool(processes=10) as pool:
            while True:
                s1, addr = edge_master_receive_server.accept()
                mission = {}
                request = json.loads(s1.recv(2048).decode("utf-8"))
                arrive_from_center_to_edge_time = time.time()
                trans_from_center_to_edge = arrive_from_center_to_edge_time - request[4]

                master_name = fetch_edge_master_name()
                print("execute了")

                req = request
                print("收到的类型是：" + str(req[0]))
                selected_pod = None

                # 用于刷新缓存
                get_resource_dataframe("pod", use_cache=False)

                pod_lists = [
                    check_pod("service" + str(i), True, True, 0, use_cache=True)
                    for i in range(1, SERVICE_TYPE_NUM + 1)
                ]
                pod_list = pod_lists[req[0] - 1]

                if len(pod_list) == 0:
                    # 传回stuck??????????????????/这样设计是否合理
                    mission = {"success": 0, "failure": 0, "stuck": 1}
                    detail_mission = {"name": master_name, "type": request[0]}

                    this_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    this_client.connect(
                        (CLOUD_IP, CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT)
                    )
                    send_task_json(this_client, mission)
                    this_client.close()

                    this_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    this_client.connect(
                        (CLOUD_IP, STUCK_TASKS_SITUATION_ON_EACH_NODE_PORT)
                    )
                    send_task_json(this_client, detail_mission)
                    this_client.close()

                else:
                    # 如果选择的是0或2，则是选择node的算法
                    if offload_algorithm_index != 1:
                        # 注意是否只传这两个参数就可以？？？？？？？？？？？？？？？？？
                        # 是否这样返回可以？？？？？？？？？？？？？？？？？
                        node_index, offload_epoch_returned_by_func = offload_service(
                            offload_algorithm_index,
                            req[0],
                            offload_epoch_index,
                            offload_epoch_index_lock,
                        )
                        if node_index == 0:
                            print("发给云")
                            this_client = socket.socket(
                                socket.AF_INET, socket.SOCK_STREAM
                            )
                            this_client.connect(
                                (CLOUD_IP, CLOUD_MASTER_RECEIVE_REQUEST_PORT)
                            )
                            # 增加edge名字
                            # 这里加了epoch_returned_by_func，云上需要返回时需要根据这个值进行记录
                            # 云上需要修改
                            req = [master_name, offload_epoch_returned_by_func, req]
                            send_task_json(this_client, req)
                        else:
                            print("本地执行")
                            # 现在已经选择了node，那么现在看看选择的node上是否有想要的pod
                            chosen_node_name = get_nodes_name()[int(node_index - 1)]
                            offload_pod_list = check_pods_of_the_type_on_this_node(
                                "service" + str(req[0]),
                                chosen_node_name,
                                True,
                                0,
                                use_cache=True,
                            )

                            if len(offload_pod_list) == 0:
                                selected_pod = None
                            # 随机选一个
                            else:
                                selected_pod = offload_pod_list[
                                    random.randint(0, len(offload_pod_list) - 1)
                                ]
                            flow = pool.apply_async(
                                local_run,
                                (
                                    local_task_count,
                                    selected_pod,
                                    req,
                                    update_index,
                                    update_index_lock,
                                    arrive_from_center_to_edge_time,
                                    trans_from_center_to_edge,
                                    offload_algorithm_index,
                                    offload_epoch_returned_by_func,
                                    pod_name_index,
                                    pod_name_index_lock,
                                ),
                            )
                            local_task_count += 1
