# -*- coding: utf-8 -*- 
import os
import re
from dataclasses import dataclass


@dataclass
class Pod(object):
    name: str
    ready: str
    status: str
    restarts: str
    age: str
    ip: str
    node: str


# 输入：pod关键字
# 输出：属性完善的pod类
# 作用：获取pod当前状态
def check_pod(target):
    pods = os.popen('kubectl get pod -o wide').read()
    # index = pods.find(target)
    index = 0
    index_list = []

    if target != 'service-greedy' and target != 'service-dqn':
        target = target + '-deployment'

    while pods.find(target, index) != -1:
        if pods.find(target, index) != len(pods) - 1:
            index_list.append(pods.find(target, index))
            index = pods.find(target, index) + 1
        else:
            index = pods.find(target, index)
            break

    pod_list = []
    for i in range(len(index_list)):
        target_pod = Pod('', '', '', '', '', '', '')
        index = index_list[i]
        while pods[index] != ' ':
            target_pod.name = target_pod.name + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.ready = target_pod.ready + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.status = target_pod.status + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.restarts = target_pod.restarts + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.age = target_pod.age + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.ip = target_pod.ip + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        while pods[index] != ' ':
            target_pod.node = target_pod.node + pods[index]
            index = index + 1
        while pods[index] == ' ':
            index = index + 1

        if target_pod.status == 'Running':
            pod_list.append(target_pod)
        # print(target_pod.status,'!')
    return pod_list


if __name__ == '__main__':
    print(check_pod('service1'))
