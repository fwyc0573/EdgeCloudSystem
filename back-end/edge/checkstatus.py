# -*- coding: utf-8 -*-
import os
import time
from kubernetes import client, watch, config
import json
import re


# /proc/cpuinfo　　cpu的信息
def cpuinfo():
    info = os.popen("cat /proc/cpuinfo").read().split("\n")
    result = {}
    for i in range(len(info)):
        if info[i].find("\t: ") == -1:
            continue
        result[info[i].split("\t: ")[0]] = info[i].split("\t: ")[1]
    return result


# /proc/meminfo 　　RAM使用的相关信息
def meminfo():
    info = os.popen("cat /proc/meminfo").read().split("\n")
    result = {}
    for i in range(len(info)):
        if info[i].find(":        ") == -1:
            continue
        result[info[i].split(":        ")[0]] = info[i].split(":        ")[1].strip()
    return result


# /proc/uptime　　系统已经运行了多久
def uptime():
    info = os.popen("cat /proc/uptime").read().split(" ")
    result = {}
    result["run time"] = info[0].strip()
    result["idle time"] = info[1].strip()
    return result


# pending pod
def pod():
    config.load_kube_config()
    v1 = client.CoreV1Api()

    pending_pod = [x for x in v1.list_pod_for_all_namespaces(watch=False).items]
    # print(pending_pod)
    return str(pending_pod)


# all ready nodes
def nodes():
    config.load_kube_config()
    v1 = client.CoreV1Api()
    ready_nodes = []
    resource = {}
    master_name = ""
    for n in v1.list_node().items:
        if "master" in n.metadata.name:
            master_name = n.metadata.name
            resource = {master_name: {}}
        else:
            for status in n.status.conditions:
                if status.status == "True" and status.type == "Ready":
                    ready_nodes.append(n)
                    current_resource = {}
                    # current_resource['memory'] = n.status.allocatable['memory']
                    # current_resource['ephemeral-storage'] = n.status.allocatable['ephemeral-storage']
                    total_str = os.popen(
                        "kubectl describe node " + n.metadata.name
                    ).read()
                    total = re.split("\n", total_str)
                    cpu = " ".join(total[-7].split())
                    memory = " ".join(total[-6].split())
                    storage = " ".join(total[-5].split())
                    cpu_percent = cpu.split(" ")[-1][1:-2]
                    cpu_number = cpu.split(" ")[-2]
                    memory_percent = memory.split(" ")[-1][1:-2]
                    memory_number = memory.split(" ")[-2]
                    storage_percent = storage.split(" ")[-1][1:-2]
                    storage_number = storage.split(" ")[-2]
                    current_resource["cpu"] = {
                        "percent": cpu_percent,
                        "number": cpu_number,
                    }
                    current_resource["memory"] = {
                        "percent": memory_percent,
                        "number": memory_number,
                    }
                    current_resource["storage"] = {
                        "percent": storage_percent,
                        "number": storage_number,
                    }
                    resource[master_name][n.metadata.name] = current_resource
                else:
                    pass
    if len(ready_nodes) == 0:
        return -1
    else:
        return resource


def get_nodes_name():
    config.load_kube_config()
    v1 = client.CoreV1Api()
    name = []
    for n in v1.list_node().items:
        if "master" not in n.metadata.name:
            name.append(n.metadata.name)
    return name


def check_status():
    result = []
    with open("./node_status_info/cpu_" + str(time.time()) + ".json", "w") as file_obj:
        cpu = cpuinfo()
        json.dump(cpu, file_obj)
        result.append(cpu)

    with open("./node_status_info/mem_" + str(time.time()) + ".json", "w") as file_obj:
        mem = meminfo()
        json.dump(mem, file_obj)
        result.append(mem)

    with open(
        "./node_status_info/uptime_" + str(time.time()) + ".json", "w"
    ) as file_obj:
        up_time = uptime()
        json.dump(up_time, file_obj)
        result.append(up_time)

    # with open('./node_status_info/pod_' + str(time.time()) + '.json', 'w') as file_obj:
    #     pending_pod = pod()
    #     json.dump(pending_pod, file_obj)
    #     result.append(pending_pod)

    # with open('./node_status_info/nodes_' + str(time.time()) + '.json', 'w') as file_obj:
    #     ready_nodes = nodes()
    #     json.dump(ready_nodes, file_obj)
    #     result.append(ready_nodes)
    #
    # print('已采集当前状态。')

    return result


if __name__ == "__main__":
    check_status()
    # while True:
    #     with open('./json/cpu_' + str(time.time()) + '.json', 'w') as file_obj:
    #         cpu = cpuinfo()
    #         json.dump(cpu, file_obj)
    #
    #     with open('./json/mem_' + str(time.time()) + '.json', 'w') as file_obj:
    #         mem = meminfo()
    #         json.dump(mem, file_obj)
    #
    #     with open('./json/uptime_' + str(time.time()) + '.json', 'w') as file_obj:
    #         uptime = uptime()
    #         json.dump(uptime, file_obj)
    #
    #     with open('./json/pod_' + str(time.time()) + '.json', 'w') as file_obj:
    #         pod = pod()
    #         json.dump(pod, file_obj)
    #
    #     with open('./json/nodes_' + str(time.time()) + '.json', 'w') as file_obj:
    #         nodes = nodes()
    #         json.dump(nodes, file_obj)
    #
    #     interval = 5000
    #     print('已采集当前状态，' + str(interval) + '秒后进行下一次采集。')
    #     time.sleep(interval)
