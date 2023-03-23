import json
import os
import pickle
import random
import re
import socket
import csv
import time

import numpy as np
import torch as t
from torch import nn
from torch.autograd import Variable
from .models import SimpleNet
from multiprocessing import Manager, Pool

from kubernetes import client, config

from .check_pod import Pod, check_pod

CLOUD_IP = "0.0.0.0"
EDGE_IP = "192.168.1.30"

"""
各类端口
"""
# 收集tasks执行的状态
CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT = 9001
# 发到云上决定
CLOUD_MASTER_RECEIVE_REQUEST_PORT = 9002
# 请求更新
CLOUD_MASTER_RECEIVE_UPDATE_PORT = 9003
# 上一次编排至今各个节点中各类型请求成功与失败数量
TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT = 9004
# 目前的各个节点的服务部署种类与数量
CURRENT_SERVICE_ON_EACH_NODE_PORT = 9005
# 各节点积压的任务种类与数量
STUCK_TASKS_SITUATION_ON_EACH_NODE_PORT = 9006
# 各节点内存使用情况
RESOURCE_ON_EACH_NODE_PORT = 9007
# 收到云上执行的情况
EDGE_MASTER_RECEIVE_RESULT_PORT = 9009

"""
各种常量
"""

K3S_CONFIG = ["./cloud/config1.yaml"]

ALG_PORT = ['4001', '4002']
ALG_NAME = ['service-greedy', 'service-dqn']
ALG_PATH = ['./app/service-greedy/service.yaml', './app/service-dqn/service.yaml']

"""
各种变量
"""
MAX_NUM_MASTER = 8
# 收集的总共的state
state = {
    'success': 0, 'failure': 0, 'stuck': 0
}


# 上一次编排至今各个节点中各类型请求成功与失败数量
# 要写死名字吗
# Dict[str,Dict[int,Dict[str,int]]]
# Dict::   边缘master名字->>种类->{success->数量,failure->数量}
# tasks_execute_situation_on_each_node_dict = {}

# 目前的各个节点的服务部署种类与数量
# Dict:: 边缘master名字->边缘worker的名字->种类->数量
# current_service_on_each_node_dict = {}

# 各节点积压的任务种类与数量
# Dict::   边缘master名字->>种类->数量
# stuck_tasks_situation_on_each_node_dict = {}

# 各节点内存使用情况
# Dict::   边缘master名字->边缘worker的名字->memory
# {'master': {'node1': '7966828Ki', 'node2': '7966836Ki'}}
# resources_on_each_node_dict = {}


# 输入：Socket，请求处理结果
# 输出：无
# 作用：将处理结果发送给终端
def send_task_json(client, result):
    result = json.dumps(result)
    task = bytes(result.encode('utf-8'))
    task_len = len(task)
    task_len = task_len.to_bytes(8, byteorder='big')
    client.sendall(task_len)
    client.sendall(task)


"""
执行请求
"""


# 输入：可用pod列表
# 输出：选中pod的序号
# 作用：卸载算法暂缺，目前使用随机卸载处理
def offload(pod_list):
    r = random.randint(0, len(pod_list) - 1)
    return r


# 输入：请求
# 输出：请求处理结果
# 作用：处理请求

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


def run_req(master_name, offload_epoch_index, req, trans_from_center_to_cloud):
    execute_start_time = time.time()
    pod_list = check_pod('service')
    pod_index = offload(pod_list)
    current_pod = pod_list[pod_index]
    while current_pod.status != 'Running':
        pod_list = check_pod('service')
        current_pod = pod_list[pod_index]
    print('开始任务执行.')
    val1 = run(f'curl http://{current_pod.ip}:3100/predict -X POST -d observation={req[0]}', 'Time:')
    result_return_to_cloud = []
    result_return_to_cloud[0] = offload_epoch_index

    mission = {'success': 0, 'failure': 0, 'stuck': -1}
    detail_mission = {'name': master_name, 'type': req[0], 'success': 0, 'failure': 0}

    execute_total_time = time.time() - execute_start_time + 2 * trans_from_center_to_cloud
    result_return_to_cloud[1] = execute_total_time

    if execute_total_time <= req[3]:
        mission['success'] += 1
        detail_mission['success'] += 1
        result_return_to_cloud[2] = 1
    else:
        mission['failure'] += 1
        detail_mission['failure'] += 1
        result_return_to_cloud[2] = 0

    result_return_to_cloud[3] = req[0]

    print(mission)
    print(detail_mission)
    client1 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client1.connect((CLOUD_IP, CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT))
    send_task_json(client1, mission)
    client1.close()
    client2 = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client2.connect((CLOUD_IP, TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT))
    send_task_json(client2, detail_mission)
    client2.close()

    client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client.connect((EDGE_IP, EDGE_MASTER_RECEIVE_RESULT_PORT))
    send_task_json(client, result_return_to_cloud)
    client.close()


# 输入：Socket
# 输出：请求处理结果
# 作用：通过Socket接收处理结果
#######################是加在这里的吗？
def receive_request_from_edge(server):
    with Pool(processes=10) as pool:
        while True:
            conn, addr = server.accept()
            task_len = conn.recv(8)
            task_len = int.from_bytes(task_len, byteorder='big')
            req = conn.recv(task_len)
            req = json.loads(req.decode('utf-8'))
            master_name = req[0]
            offload_epoch_index = req[1]
            req = req[2]
            print('已接受到' + str(req[0]) + '号服务请求，offload编号为' + str(offload_epoch_index) + '开始执行.')

            arrive_from_center_to_cloud = time.time()
            trans_from_center_to_cloud = arrive_from_center_to_cloud - req[4]
            # 此处直接使用贪心即可
            # 不确定这里到底是不是get
            pool.apply_async(run_req, (master_name, offload_epoch_index, req, trans_from_center_to_cloud))


def execute():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((CLOUD_IP, CLOUD_MASTER_RECEIVE_REQUEST_PORT))
    print("云端启动，准备接受任务(2/2)")
    server.listen(MAX_NUM_MASTER)
    receive_request_from_edge(server)


def collect_data(managerState, mdata_lock):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setblocking(1)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    s.bind((CLOUD_IP, CLOUD_MASTER_COLLECT_TASKS_SITUATION_PORT))
    print("collect")
    s.listen(MAX_NUM_MASTER)

    while True:
        c, addr = s.accept()
        mission_len = c.recv(8)
        mission_len = int.from_bytes(mission_len, byteorder='big')
        this_mission = c.recv(mission_len)
        mission = json.loads(this_mission.decode('utf-8'))
        print(mission)
        state['success'] += mission['success']
        state['failure'] += mission['failure']
        state['stuck'] += mission['stuck']
        with mdata_lock:
            managerState['success'] = state['success']
            managerState['failure'] = state['failure']
            managerState['stuck'] = state['stuck']
        print(str(state['success']) + " " +
              str(state['failure']) + " " + str(state['stuck']))
        c.close()
        with open('./collect.csv', 'a+', newline="") as f:
            csv_write = csv.writer(f)
            data_row = [state['success'], state['failure'], state['stuck']]
            csv_write.writerow(data_row)
            f.close()


"""
编排更新
"""


def valueclone_nested_dict_proxy(dict_proxy):
    """
        clone 出一份不含 proxy 的普通 dict
        注意只能用于树状结构的嵌套 dict proxy
    """
    from multiprocessing.managers import BaseProxy
    dict_copy = dict_proxy._getvalue()
    for key, value in dict_copy.items():
        if isinstance(value, BaseProxy):
            dict_copy[key] = valueclone_nested_dict_proxy(value)
    print(dict_copy)
    return dict_copy


# 重新编排pod的进程


def update_pod_cloud(manager_tasks_execute_situation_on_each_node_dict, manager_current_service_on_each_node_dict,
                     manager_stuck_tasks_situation_on_each_node_dict, manager_resources_on_each_node_dict,
                     share_lock1, share_lock2, share_lock3, share_lock4):
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((CLOUD_IP, CLOUD_MASTER_RECEIVE_UPDATE_PORT))
    print("云端启动，准备接受更新(1/2)")
    server.listen(MAX_NUM_MASTER)

    epoch_index = 0
    while True:
        c, addr = server.accept()
        pre_len = c.recv(8)
        pre_len = int.from_bytes(pre_len, byteorder='big')
        pre = c.recv(pre_len)
        pre = json.loads(pre.decode('utf-8'))
        this_master_name = pre[0]
        update_interval = pre[1]
        with share_lock1, share_lock2, share_lock3, share_lock4:
            # param1 = tasks_execute_situation_on_each_node_dict
            print('--------------------param1')
            param1 = valueclone_nested_dict_proxy(
                manager_tasks_execute_situation_on_each_node_dict)
            print('--------------------param2')
            param2 = valueclone_nested_dict_proxy(
                manager_current_service_on_each_node_dict)
            print('--------------------param3')
            param3 = valueclone_nested_dict_proxy(
                manager_stuck_tasks_situation_on_each_node_dict)
            print('--------------------param4')
            param4 = valueclone_nested_dict_proxy(
                manager_resources_on_each_node_dict)

            # 想要写对应的dict必须持有对应的锁
            # 拿到锁，clone完了clear，最后放开锁
            clear_all(this_master_name, manager_tasks_execute_situation_on_each_node_dict,
                      manager_current_service_on_each_node_dict,
                      manager_stuck_tasks_situation_on_each_node_dict, manager_resources_on_each_node_dict)
        print('---------------------------------开始dqn')
        greedy_result = placement_chosen(
            this_master_name, update_interval, param1, param2, param3, param4, 1, epoch_index)
        # 发送回去
        greedy_result = [epoch_index, greedy_result]
        send_task_json(c, greedy_result)
        c.close()
        epoch_index += 1
        # with open('./collect.csv', 'a+', newline="") as f:
        #     csv_write = csv.writer(f)
        #     csv_write.writerow('u')
        #     f.close()
    # receive_update(server)


def clear_all(this_master_name, *dict_proxies):
    for dict_proxy in dict_proxies:
        if this_master_name in dict_proxy:
            dict_proxy[this_master_name].clear()


# 这是一个单独的进程
def collect_tasks_execute_situation_on_each_node(manager_tasks_execute_situation_on_each_node_dict, share_lock):
    print("收集任务执行进程启动！")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((CLOUD_IP, TASKS_EXECUTE_SITUATION_ON_EACH_NODE_PORT))
    server.listen(MAX_NUM_MASTER)

    with Manager() as manager:
        while True:
            c, addr = server.accept()
            mission_len = c.recv(8)
            mission_len = int.from_bytes(mission_len, byteorder='big')
            this_mission = c.recv(mission_len)
            mission = json.loads(this_mission.decode('utf-8'))

            print(mission)
            if len(mission) == 2:
                mask = mission[1]
                mission = mission[0]
            else:
                mask = 0
            if len(mission) > 0:
                name = mission['name']
                type = mission['type']
                success = mission['success']
                failure = mission['failure']
            # if name in tasks_execute_situation_on_each_node_dict.keys():
            #     tmp_dict = tasks_execute_situation_on_each_node_dict[name]
            #     if type in tmp_dict:
            #         old_success = tmp_dict[type]['success']
            #         old_failure = tmp_dict[type]['failure']
            #         tasks_execute_situation_on_each_node_dict[name][type] = {'success': old_success + success,
            #                                                                  'failure': old_failure + failure}
            #     else:
            #         tasks_execute_situation_on_each_node_dict[name][type] = {'success': success, 'failure': failure}
            # else:
            #     tasks_execute_situation_on_each_node_dict[name] = {type: {'success': success, 'failure': failure}}
            # tmp1_dict = tasks_execute_situation_on_each_node_dict.setdefault(name, {})
            # tmp2_dict = tmp1_dict.setdefault(type, {'success': 0, 'failure': 0})
            # tmp2_dict['success'] += success
            # tmp2_dict['failure'] += failure
            with share_lock:
                tmp1_dict = manager_tasks_execute_situation_on_each_node_dict.setdefault(
                    name, manager.dict())
                inner_dict = manager.dict()
                inner_dict['success'] = 0
                inner_dict['failure'] = 0
                tmp2_dict = tmp1_dict.setdefault(type, inner_dict)
                tmp2_dict['success'] += success
                tmp2_dict['failure'] += failure

            if mask == 1:
                return_result = valueclone_nested_dict_proxy(manager_tasks_execute_situation_on_each_node_dict)
                send_task_json(c, return_result)
                c.close()


# 边缘master名字->边缘worker的名字->种类->数量
def current_service_on_each_node(manager_current_service_on_each_node_dict, share_lock):
    print("收集服务进程启动！")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((CLOUD_IP, CURRENT_SERVICE_ON_EACH_NODE_PORT))
    server.listen(MAX_NUM_MASTER)

    with Manager() as manager:
        while True:
            conn, addr = server.accept()
            # 格式[master_name, [pod.__dict__ for pod in update_info], 0]
            current_service_len = conn.recv(8)
            current_service_len = int.from_bytes(current_service_len, byteorder='big')
            current_service = conn.recv(current_service_len)
            current_service = json.loads(current_service.decode('utf-8'))
            current_service[1] = [make_pod(pod_dict)
                                  for pod_dict in current_service[1]]
            master_name = current_service[0]
            with share_lock:
                tmp1_dict = manager_current_service_on_each_node_dict.setdefault(
                    master_name, manager.dict())
                for pod in current_service[1]:
                    pod_status = pod.status
                    if pod_status != 'Running':
                        continue
                    node_name = pod.node
                    if node_name in tmp1_dict:
                        tmp2_dict = tmp1_dict[node_name]
                    else:
                        tmp2_dict = manager.dict()
                        tmp1_dict[node_name] = tmp2_dict
                    service_name = re.match(
                        r'^(.*?)-deployment', pod.name.lstrip())
                    if service_name is None:
                        continue
                    else:
                        service_name = service_name.group(1)
                    type = re.findall(r'\d+\.?\d*', service_name)[0]
                    # inner_dict = manager.dict()
                    # inner_dict[type] = 0
                    if type in tmp2_dict:
                        tmp2_dict[type] += 1
                    else:
                        tmp2_dict[type] = 1
            conn.sendall(b'\0')
            conn.close()


# Dict::   边缘master名字->>种类->数量
def stuck_tasks_situation_on_each_node(manager_stuck_tasks_situation_on_each_node_dict, share_lock):
    print("收集stuck任务进程启动！")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((CLOUD_IP, STUCK_TASKS_SITUATION_ON_EACH_NODE_PORT))
    server.listen(MAX_NUM_MASTER)

    with Manager() as manager:
        while True:
            c, addr = server.accept()
            mission_len = c.recv(8)
            mission_len = int.from_bytes(mission_len, byteorder='big')
            this_mission = c.recv(mission_len)
            detail_mission = json.loads(this_mission.decode('utf-8'))
            c.close()
            name = detail_mission['name']
            type = detail_mission['type']
            with share_lock:
                tmp1_dict = manager_stuck_tasks_situation_on_each_node_dict.setdefault(
                    name, manager.dict())
                inner_dict = manager.dict()
                inner_dict['stuck'] = 0
                tmp2_dict = tmp1_dict.setdefault(type, inner_dict)
                tmp2_dict['stuck'] += 1


def resources_on_each_node(manager_resources_on_each_node_dict, share_lock):
    print("收集memory进程启动！")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setblocking(1)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    server.bind((CLOUD_IP, RESOURCE_ON_EACH_NODE_PORT))
    server.listen(MAX_NUM_MASTER)
    while True:
        c, addr = server.accept()
        resources_len = c.recv(8)
        resources_len = int.from_bytes(resources_len, byteorder='big')
        resources = c.recv(resources_len)
        resources = json.loads(resources.decode('utf-8'))
        print('收集函数：')
        print(resources)
        with share_lock:
            for master_name in resources:
                manager_resources_on_each_node_dict[master_name] = resources[master_name]
            print(manager_resources_on_each_node_dict._getvalue())
        c.sendall(b'\0')
        c.close()


# 输入： socket
# 输出：无
# 作用：接收数据
# def receive_update(server):
#     while True:
#         conn, addr = server.accept()
#         length_data = conn.recv(6)
#         length = int.from_bytes(length_data, byteorder='big')
#         b = bytes()
#         if length == 0:
#             break
#         count = 0
#         while True:
#             value = conn.recv(length)
#             b = b + value
#             count += len(value)
#             if count >= length:
#                 break
#         update_info = pickle.loads(b)
#         # 这是什么，问？
#         update_info[1] = [make_pod(pod_dict) for pod_dict in update_info[1]]
#         print('已接收到来自' + str(update_info[0]) + '名为master更新请求,', update_info)
#         collect_tasks_execute_situation_on_each_node_result = collect_tasks_execute_situation_on_each_node()
#         current_service_on_each_node_result = current_service_on_each_node()
#         stuck_tasks_situation_on_each_node_result = stuck_tasks_situation_on_each_node()
#         resources_on_each_node_result = resources_on_each_node()
#         result = execute_update(update_info)
#         send_task(conn, result)


def make_pod(pod_dict):
    pod = Pod('', '', '', '', '', '', '')
    pod.__dict__ = pod_dict
    return pod


# 输入： Master的更新信息
# 输出：新的pod部署关系
# 作用：重新编排部署pod

# def execute_update(update_info):
#     config.kube_config.load_kube_config(config_file=K3S_CONFIG[update_info[2]])
#     # 获取API的CoreV1Api版本对象
#     v1 = client.CoreV1Api()
#     ready_nodes = []
#     for n in v1.list_node().items:
#         for status in n.status.conditions:
#             if status.status == True and status.type == "Ready":
#                 ready_nodes.append(n.metadata.name)
#     print('ready_nodes:', ready_nodes)
#     pod_update_result = []
#     for i in update_info[0]:
#         for j in range(20):
#             if str(i.name.split('-')[0]).strip() == str(NAME[j]).strip():
#                 print('\n待部署:', i.node, '-', NAME[j])
#                 print('delete: ', i.name.strip())
#                 resp = v1.delete_namespaced_pod(
#                     namespace="default", name=i.name.strip())
#                 new_node = random.choice(ready_nodes)
#                 print('重新部署为:', new_node, '-', NAME[j], '\n')
#                 pod_update_result.append([j, new_node])
#     return pod_update_result


def placement_chosen(master_name, update_interval, tasks_execute_situation_on_each_node_dict,
                     current_service_on_each_node_dict,
                     stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict, i, epoch_index):
    """
    :param
    比如这个集群里类型3的请求失败率特别高，那我们就要在集群多部署类型3的服务来加快处理
    tasks_execute_situation_on_each_node_dict: 上一次编排至今各个节点中各类型请求成功与失败数量
    :param
    current_service_on_each_node_dict: 目前的各个节点的服务部署种类与数量
    :param
    stuck_tasks_situation_on_each_node_dict: 各节点积压的任务种类与数量
    :param
    resources_on_each_node_dict: 各节点内存使用情况
    :param i:
    选择种类
    :return:

    1.待编排的节点：选2个所有边缘集群的node。
    2.对节点的操作：选出是增加还是删除某个类型的服务
    [-MAX_KIND，MAX_KIND]
    [-MAX_KIND，MAX_KIND]
    """

    result = ''
    # if i == 0:
    #     result = greedy_algorithm_placement(master_name, update_interval, tasks_execute_situation_on_each_node_dict,
    #                                         current_service_on_each_node_dict,stuck_tasks_situation_on_each_node_dict,
    #                                         resources_on_each_node_dict,epoch_index)
    # elif i == 1:
    #     result = q_learning_placement(master_name, update_interval, tasks_execute_situation_on_each_node_dict,
    #                                   current_service_on_each_node_dict,stuck_tasks_situation_on_each_node_dict,
    #                                   resources_on_each_node_dict, epoch_index)
    print("采用编排算法容器：", ALG_NAME[i])
    observation = json.dumps([master_name, update_interval, tasks_execute_situation_on_each_node_dict,
                              current_service_on_each_node_dict,
                              stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict,
                              epoch_index])
    alg_pod = check_pod(ALG_NAME[i])
    alg_ip = alg_pod[0].ip
    result = os.popen(
        'curl http://' + alg_ip + ':' + ALG_PORT[i] + '/predict -X POST -d \'observation=' + observation + '\''
    ).read()

    result = json.loads(result)
    result[1] = int(result[1])
    result[2] = int(result[2])
    return result


def greedy_algorithm_placement(master_name, update_interval, tasks_execute_situation_on_each_node_dict,
                               current_service_on_each_node_dict,
                               stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict, epoch_index):
    """
    贪心算法

    请求失败的多并且并没有这个种类的，内存，cpu够的情况下就+
    服务部署种类有但是请求中没有就-

    :param
    map::   边缘master名字->>种类->{success->数量，failure->数量}
    tasks_execute_situation_on_each_node: 上一次编排至今各个节点中各类型请求成功与失败数量
    :param
    map::   边缘master名字->边缘worker的名字->种类->数量
    current_service_on_each_node: 目前的各个节点的服务部署种类与数量
    :param
    # map::   边缘master名字->>种类->数量
    stuck_tasks_situation_on_each_node: 各节点积压的任务种类与数量
    :param
    # Dict::   边缘master名字->边缘worker的名字->{memory,cpu,storage}
    resources_on_each_node: 各节点内存使用情况
    :return:
    对节点的操作：选出是增加还是删除某个类型的服务

    两个动作，但他们取值范围不一样

    比如有12种服务类型的话
    第一个动作取  -12，-11，-10，..., 0。代表删除某种服务，或无动作(0)
    第二个动作取1,2,3,4,...,12。代表部署某种服务

    第一个动作资源不够的情况下不能取零
    第二个动作不能取零


    按策略在取值范围里选，贪心策略或者机器学习
    [-MAX_KIND，MAX_KIND]
    [-MAX_KIND，MAX_KIND]
    """
    result = []
    failure_box = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2]
    success_box = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

    # 选第一个参数
    print(tasks_execute_situation_on_each_node_dict)
    first_dict = tasks_execute_situation_on_each_node_dict[master_name]
    print(first_dict)
    for type in first_dict:
        value = first_dict[type]
        print(value)
        failure_percent = value['failure'] / \
                          (value['success'] + value['failure'])
        failure_box[type - 1] = failure_percent
        success_box[type - 1] = 1 - failure_percent

    print('失败率：')
    print(failure_box)
    first_param = None

    # 确定是否要删除,每个节点剩余都小于1Gi的话删
    if_delete = True
    second_dict = resources_on_each_node_dict[master_name]
    # {'node1': {'memory': '12193908Ki', 'ephemeral-storage': '18903225108'}
    for node in second_dict:
        resources = second_dict[node]
        cpu = resources['cpu']
        cpu_percent = cpu['percent']
        cpu_number = cpu['number']
        memory = resources['memory']
        memory_percent = memory['percent']
        memory_number = memory['number']
        ephemeral_storage = resources['storage']
        ephemeral_storage_percent = ephemeral_storage['percent']
        ephemeral_storage_number = ephemeral_storage['number']
        if int(memory_percent) <= 90:
            if_delete = False

    if if_delete:
        # 如果要删除，在现有服务中选一个：1.根本没出现 2.失败率最低（成功率最高）
        third_dict = current_service_on_each_node_dict[master_name]
        current_service = []
        for node_name in third_dict:
            fourth_dict = third_dict[node_name]
            for type in fourth_dict:
                current_service.append(type)

        for i in current_service:
            if failure_box[i - 1] == -2:
                first_param = i - 1
                break

        if first_param is None:
            l_failure = 1
            for i in current_service:
                if failure_box[i - 1] < l_failure:
                    first_param = i - 1
        # 传过来的是0-11，现在要换成1-12传回去
        first_param += 1
        first_param *= -1
    else:
        first_param = 0

    # 选第二个参数
    # 选出失败率最大的那个
    max_failure = -2
    second_param = -1
    for i in range(len(failure_box)):
        if failure_box[i] > max_failure:
            max_failure = failure_box[i]
            second_param = i + 1

    min_success = 2
    # 如果最大失败率为0，说明没有失败的，那么选出成功率最小的那个
    if max_failure == 0:
        for i in range(len(success_box)):
            if success_box[i] < min_success:
                min_success = success_box[i]
                second_param = i + 1

    # 如果最大失败率为 - 2，说明本段时间里根本没有成功/失败的任务。那么哪个积压的多选哪个
    elif max_failure == -2:
        max_stuck = 0
        # 设置为0，要是还是没有积压的那就直接选任务1
        second_param = 0
        fifth_dict = stuck_tasks_situation_on_each_node_dict[master_name]
        for type in fifth_dict:
            num = fifth_dict[type]['stuck']
            if num > max_stuck:
                max_stuck = num
                second_param = type

    success = np.zeros(20).astype(int)
    for key, the_dict in first_dict.items():
        success[key] = the_dict['success']

    reward = success.sum()

    if epoch_index > 0:
        with open('./reward_hist.csv', 'a+', newline="") as f2:
            csv_write = csv.writer(f2)
            csv_write.writerow([epoch_index, reward / update_interval])  # 记得要改
            f2.close()

    result.append(master_name)
    result.append(first_param)
    result.append(second_param)
    print(result)

    return result


class DQNAgent:
    def __init__(self, state_size, action_size, replay_memory_size,
                 mini_batch_size, replace_target_period, gamma, epsilon=1.0, epsilon_min=0.01, epsilon_decrement=0.001,
                 learning_rate=0.005):
        self.state_size = state_size
        self.action_size = action_size
        # 能存多少数据
        self.replay_memory_size = replay_memory_size
        # 每次能取多少进行训练
        self.mini_batch_size = mini_batch_size
        # s,s',action,reward
        self.memory = t.zeros((self.replay_memory_size, state_size * 2 + 2))
        # 折扣率
        self.gamma = gamma
        # 探索非贪心
        self.epsilon = epsilon
        self.epsilon_min = epsilon_min
        self.learning_rate = learning_rate
        self.epsilon_decrement = epsilon_decrement
        self.eval_model = SimpleNet(state_size)
        self.target_model = SimpleNet(state_size)
        # 是否需要修改
        self.optimizer = self.eval_model.get_optimizer(self.learning_rate, self.gamma)
        self.loss_hist = []
        # 记录每个epoch的loss
        self.loss_epoch_hist = []
        self.memory_counter = 0
        self.learning_step = 0
        self.replace_target_period = replace_target_period
        # 是否需要换成nn.CrossEntropyLoss()
        self.loss_func = nn.MSELoss()

    # # self-define loss function
    # def _loss(self, target, prediction):
    #     # sqrt(1+error^2)-1
    #     # 为什么-1
    #     error = prediction - target
    #     return ((error.pow(2) + 1).sqrt()).mean(axis=-1)

    def update_target_model(self):
        self.target_model.load_state_dict(self.eval_model.state_dict())

    # 这些量都是tensor
    def remember(self, state, action, reward, next_state):
        if not hasattr(self, 'memory_counter'):
            self.memory_counter = 0
        transition = t.cat((state, action, reward, next_state), dim=1)
        index = self.memory_counter % self.replay_memory_size
        self.memory[index, :] = transition
        self.memory_counter += 1

    def act(self, x):
        x = Variable(x)
        if np.random.rand() <= self.epsilon:
            if x[:, -1].item() == 0:
                return random.randrange(20)
            else:
                return random.randrange(20, self.action_size)
        act_values = self.eval_model.forward(x)
        return t.max(act_values, 1)[1].data.numpy()[0]

    def replay(self):
        if self.memory_counter > self.replay_memory_size:
            sample_index = np.random.choice(self.replay_memory_size, size=self.mini_batch_size)
        else:
            sample_index = np.random.choice(self.memory_counter, size=self.mini_batch_size)
        # 训练时，每次取经验池中的batchsize条observation
        batch_memory = self.memory[sample_index, :]

        # obtain the samples
        b_s = Variable(t.FloatTensor(batch_memory[:, :self.state_size]))
        b_a = Variable(t.IntTensor(batch_memory[:, self.state_size:self.state_size + 1].int()))
        b_r = Variable(t.FloatTensor(batch_memory[:, self.state_size + 1:self.state_size + 2]))
        b_s_ = Variable(t.FloatTensor(batch_memory[:, -self.state_size:]))

        # 将当前state输入训练网络，得到Q(s,a)
        q_eval = self.eval_model.forward(b_s)
        q_eval_action = t.max(q_eval, 1)[1].data.numpy()[0]
        # .gather(1, b_a)

        # detach()不会反向传播
        # 根据记录的action下标，选取对应Q(s,a)。将对应的next_state输入目标网络，并选取最大值maxQ(s',a')
        q_target = self.target_model.forward(b_s_).detach()
        q_target_action = t.max(q_target, 1)[1].data.numpy()[0]

        # obtain the target q values for the comparison with eval q values
        for idx_mini_batch in range(self.mini_batch_size):
            action = int(batch_memory[idx_mini_batch, self.state_size].numpy())
            q_target[idx_mini_batch, action] = batch_memory[idx_mini_batch, self.state_size + 1] + self.gamma * \
                                               q_target[idx_mini_batch].view(1, -1).max(1)[0]

        # mini-batch
        loss = self.loss_func(q_eval, q_target)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        self.epsilon = self.epsilon - self.epsilon_decrement if self.epsilon > self.epsilon_min else self.epsilon_min

        # record the learning step already been done
        self.learning_step = self.learning_step + 1

        # replace target network periodically
        if self.learning_step % self.replace_target_period == 0:
            self.update_target_model()

        return loss


# actual action to flat action
def obtain_1_d_action(initial_delete_fn, initial_add_fn, map_fn):
    flat_action = map_fn[initial_delete_fn, initial_add_fn - 1]
    return flat_action


def obtain_actual_action(map_fn, control_action_fn):
    # find the index
    actual_action = np.argwhere(map_fn == control_action_fn)
    # take out the actual actions
    actual_delete = actual_action[0][0]
    actual_add = actual_action[0][1] + 1
    return actual_delete.item(), actual_add.item()


def calc_reward(success_t):
    success_t = t.sum(success_t, dim=1)
    return success_t


def q_learning_placement(master_name, update_interval, tasks_execute_situation_on_each_node_dict,
                         current_service_on_each_node_dict,
                         stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict, epoch_index):
    """
    强化学习
    分析：

    :param
    map::   节点名字->>种类->{success->数量，failure->数量}
    tasks_execute_situation_on_each_node: 上一次编排至今各个节点中各类型请求成功与失败数量
    {'master':{4:{'success':1,'failure':0},11:{'success':0,'failure':1}}}
    :param
    map::   节点名字->>种类->数量
    current_service_on_each_node: 目前的各个节点的服务部署种类与数量
    {'master':{'node2':{2:1},'node1':{3:1,0:1,1:1}}}
    :param
    map::   节点名字->>种类->数量
    stuck_tasks_situation_on_each_node: 各节点积压的任务种类与数量
    {'master':{4:{'stuck':1},11:{'stuck':1},6:{'stuck':1}}}
    :param
    Dict::   边缘master名字->边缘worker的名字->{memory,cpu,storage}
    resources_on_each_node: 各节点内存使用情况
    {'master':{'node1':{'memory':{'percent':'13','number':'2098Mi'},'storage':{'percent':'3','number':'4Gi'},'cpu':{'percent':'2','number':'100m'}},'node2':{'memory':{'percent':'13','number':'2098Mi'},'storage':{'percent':'3','number':'4Gi'},'cpu':{'percent':'2','number':'100m'}}}
    :return:
    1.待编排的节点：选2个所有边缘集群的node。
    2.对节点的操作：选出是增加还是删除某个类型的服务
    [-MAX_KIND，MAX_KIND]
    [-MAX_KIND，MAX_KIND]
    """
    success = np.zeros(20).astype(int)
    failure = np.zeros(20).astype(int)
    stuck = np.zeros(20).astype(int)
    service = np.zeros(20).astype(int)
    if_delete = np.array([1])

    param1 = tasks_execute_situation_on_each_node_dict[master_name]
    param2 = current_service_on_each_node_dict[master_name]
    param3 = stuck_tasks_situation_on_each_node_dict[master_name]
    param4 = resources_on_each_node_dict[master_name]

    for key, the_dict in param1.items():
        success[key - 1] = the_dict['success']
        failure[key - 1] = the_dict['failure']

    for key1, value1 in param2.items():
        for key2, value2 in value1.items():
            service[key2 - 1] += value2

    for key, the_dict in param3.items():
        stuck[key - 1] = the_dict['stuck']

    for key, the_dict in param4.items():
        cpu = the_dict['cpu']
        cpu_percent = cpu['percent']
        cpu_number = cpu['number']
        memory = the_dict['memory']
        memory_percent = memory['percent']
        memory_number = memory['number']
        ephemeral_storage = the_dict['storage']
        ephemeral_storage_percent = ephemeral_storage['percent']
        ephemeral_storage_number = ephemeral_storage['number']
        if int(memory_percent) + 6 <= 90:
            if_delete = np.array([0])
            break

    print('success-----------------------')
    print(success)
    print('failure-----------------------')
    print(failure)
    print('stuck-----------------------')
    print(stuck)
    print('service-----------------------')
    print(service)
    print('if_dalete-----------------------')
    print(if_delete)

    raw_s = np.concatenate((success, failure, stuck, service, if_delete))
    current_state = t.FloatTensor(raw_s)
    current_state = t.FloatTensor(current_state).view(1, -1)

    # some constants
    STATE_SIZE = 81
    ADD_ACTION = 20
    DELETE_ACTION = 21
    EPOCH_NUM = 30000
    ACTION_SIZE = DELETE_ACTION * ADD_ACTION
    REPLAY_MEMORY_SIZE = 5000
    MINI_BATCH_SIZE = update_interval  # 可调
    REPLACE_TARGET_PERIOD = 250
    # 折扣率
    GAMMA = 0.9
    # 试探率
    EPSILON = 1.0
    EPSILON_MIN = 0.01
    EPSILON_DECREMENT = 0.001
    # lr
    LEARNING_RATE = 0.005

    # need this map to find action
    flat_action_num = DELETE_ACTION * ADD_ACTION
    CONTROL_ACTION_MAP = np.arange(flat_action_num).reshape(DELETE_ACTION, ADD_ACTION)

    if epoch_index == 0:
        agent = DQNAgent(state_size=STATE_SIZE, action_size=ACTION_SIZE, replay_memory_size=REPLAY_MEMORY_SIZE,
                         mini_batch_size=MINI_BATCH_SIZE, replace_target_period=REPLACE_TARGET_PERIOD, gamma=GAMMA,
                         epsilon=EPSILON, epsilon_min=EPSILON_MIN, epsilon_decrement=EPSILON_DECREMENT,
                         learning_rate=LEARNING_RATE)
    else:
        agent_path = 'agent_pickled.txt'
        with open(agent_path, 'rb') as f:
            try:
                agent = pickle.load(f)
                print('load成功：', epoch_index)
            except Exception as e:
                print('can not be loaded')
                raise  # 处理不了的 Exception 应该继续抛出，防止后面的代码被执行
            finally:
                f.close()

    # 得到state状态，tensor形式
    control_action = agent.act(current_state)

    # 得到加减
    next_delete, next_add = obtain_actual_action(CONTROL_ACTION_MAP, control_action)

    # get the reward，tensor形式
    the_success = current_state[:, :20]
    reward = calc_reward(the_success)

    if_delete = np.array([1])
    if next_delete == 0:
        for key, the_dict in param4.items():
            cpu = the_dict['cpu']
            cpu_percent = cpu['percent']
            cpu_number = cpu['number']
            memory = the_dict['memory']
            memory_percent = memory['percent']
            memory_number = memory['number']
            ephemeral_storage = the_dict['storage']
            ephemeral_storage_percent = ephemeral_storage['percent']
            ephemeral_storage_number = ephemeral_storage['number']
            if int(memory_percent) + 6 <= 90:
                if_delete = np.array([0])
                break

    control_action = np.array([control_action])
    control_action = t.IntTensor(control_action).view(1, -1)
    reward = np.array([reward])
    reward = t.FloatTensor(reward).view(1, -1)
    if_delete = np.array([1])
    next_state = np.concatenate((success, failure, stuck, service, if_delete))
    next_state = t.FloatTensor(next_state).view(1, -1)

    agent.remember(current_state, control_action, reward, next_state)

    # if there are enough transitions, perform learning
    if epoch_index >= MINI_BATCH_SIZE:
        cur_loss = agent.replay()
        with open('./loss_hist.csv', 'a+', newline="") as f1:
            csv_write = csv.writer(f1)
            csv_write.writerow([epoch_index, cur_loss.item()])
            f1.close()

    # record the reward
    if epoch_index > 0:
        with open('./reward_hist.csv', 'a+', newline="") as f2:
            csv_write = csv.writer(f2)
            csv_write.writerow([epoch_index, reward.item() / update_interval])  # 记得要改
            f2.close()

    with open('agent_pickled.txt', 'wb') as f:
        print('save成功：', epoch_index)
        pickle.dump(agent, f)
        f.close()

    result = [master_name, next_delete * (-1), next_add]
    print(result)
    return result
