# -*- coding: utf-8 -*-
import re
import subprocess
from dataclasses import dataclass
from io import StringIO
from typing import Callable, List, Optional, Pattern, Union

import numpy as np
import pandas as pd
from pandas.core.series import Series
from typing_extensions import Literal

# 根据edge集群里的名字变化
# edge_node_name = ['edgecluster1-node1', 'edgecluster1-node2']
edge_node_name = ['node1', 'node2']


@dataclass
class Pod(object):
    name: str  # service1-deployment1
    fullname: str  # service1-deployment1-598d588bcd-8zttc
    ready: str  # 0/1
    status: str  # ErrImageNeverPull
    restarts: str  # 0
    age: str  # 51s
    ip: str  # 10.244.2.95
    node: str  # node2


cache = {}


def get_resource_dataframe(resource: Union[Literal['node'], Literal['pod']], use_cache=False) -> pd.DataFrame:
    if use_cache and resource in cache:
        return cache[resource]
    output = subprocess.getoutput(f'kubectl get {resource} -o wide')
    resource_dataframe = pd.read_csv(
        StringIO(output), sep=r'\s{2,}', engine='python')
    cache[resource] = resource_dataframe
    return resource_dataframe


class CheckPodRules(list):
    # pod_name_regex,node_resource_regex
    regex_list = [re.compile(r'^(service\d+-deployment\d*)-[0-9a-f]+-[0-9a-z]+$'),
                  re.compile(r'^(node\d+-resource-deployment)-[0-9a-f]+-[0-9a-z]+$'),
                  re.compile(r'^(.+-offload-deployment)-[0-9a-f]+-[0-9a-z]+$')]

    def __init__(self, name_starts_with: Optional[str] = None, if_check_regex: bool = True, regex_index: int = 0, check_running: Optional[bool] = None, rules=[]):
        if check_running is not None:
            self.append(CheckPodRules.check_running(check_running))
        if name_starts_with is not None:
            self.append(CheckPodRules.name_starts_with(name_starts_with))
        if if_check_regex is not None:
            self.append(CheckPodRules.rename_by_regex(CheckPodRules.regex_list[regex_index]))
        self += rules

    @staticmethod
    def name_starts_with(prefix: str):
        def rule(pod: Pod, row: Series):
            return pod if pod.fullname.startswith(prefix) else None
        return rule

    @staticmethod
    def rename_by_regex(regex: Pattern[str]):
        def rule(pod: Pod, row: Series):
            matches = re.match(regex, pod.fullname)
            if matches is None:
                return
            pod.name = matches.group(1)
            return pod
        return rule

    @staticmethod
    def check_running(running: bool):
        def rule(pod: Pod, row: Series):
            return pod if (pod.status != 'Running') ^ running else None
        return rule


def check_pod_impl(rules: List[Callable[[Pod, Series], Optional[Pod]]] = [], use_cache=False) -> List[Pod]:
    pod_list = []
    for idx, row in get_resource_dataframe('pod', use_cache=use_cache).iterrows():
        fullname = str(row['NAME'])
        pod = Pod(
            name=fullname,
            fullname=fullname,
            ready=str(row['READY']),
            status=str(row['STATUS']),
            restarts=str(row['RESTARTS']),
            age=str(row['AGE']),
            ip=str(row['IP']),
            node=str(row['NODE']),
        )
        for rule in rules:
            pod = rule(pod, row)
            if pod is None:
                break
        if pod is not None:
            pod_list.append(pod)
    return pod_list


def check_pod_not_running(name_starts_with: Optional[str] = None, if_check_regex: bool = True,
                          regex_index: int = 0, use_cache=False) -> List[Pod]:
    return check_pod_impl(CheckPodRules(name_starts_with=name_starts_with, if_check_regex=if_check_regex, regex_index=regex_index, check_running=False), use_cache)


def check_all_pod(if_check_regex, regex_index, use_cache=False):
    return check_pod_impl(CheckPodRules(if_check_regex=if_check_regex, regex_index=regex_index, check_running=True), use_cache)


# 输入：pod关键字
# 输出：属性完善的pod类
# 作用：获取pod当前状态
def check_pod(target, require_running, if_check_regex, regex_index, use_cache=False):
    return check_pod_impl(CheckPodRules(name_starts_with=target + '-deployment', check_running=True if require_running else None,
                                        if_check_regex=if_check_regex,
                                        regex_index=regex_index), use_cache)


def check_pod_for_not_running(target, if_check_regex, regex_index, use_cache=False):
    return check_pod_not_running(name_starts_with=target + '-deployment', if_check_regex=if_check_regex,
                                 regex_index=regex_index, use_cache=use_cache)


def check_running_pod_for_all_name(if_check_regex, regex_index, use_cache=False):
    return [pod.name for pod in check_all_pod(if_check_regex=if_check_regex, regex_index=regex_index, use_cache=use_cache)]


def check_pod_for_its_node(deployment_name, service_name, if_check_regex, regex_index, use_cache=False):
    pod_list = check_pod_impl(CheckPodRules(name_starts_with=service_name + '-deployment', if_check_regex=if_check_regex,
                                            regex_index=regex_index), use_cache)
    for pod in pod_list:
        if pod.name == deployment_name:
            return pod.node
    raise Exception(f'Pod not found with deployment_name={deployment_name} and service_name={service_name}')


def check_pods_of_the_type_on_this_node(service_name, node_name, if_check_regex, regex_index, use_cache=False):
    pod_on_the_node_list = []
    pod_list = check_pod_impl(CheckPodRules(name_starts_with=service_name + '-deployment', if_check_regex=if_check_regex,
                                            regex_index=regex_index), use_cache)
    for pod in pod_list:
        if pod.node == node_name:
            pod_on_the_node_list.append(pod)
    return pod_on_the_node_list


def check_pods_num_for_this_edge_cluster(if_check_regex, regex_index, use_cache=False):
    pods_num = np.zeros(40)
    all_pods = check_pod_impl(CheckPodRules(name_starts_with='service', check_running=True, if_check_regex=if_check_regex,
                                            regex_index=regex_index), use_cache)
    for pod in all_pods:
        for i in range(2):
            if pod.node == edge_node_name[i]:
                pod_type = re.findall(r'\d+\.?\d*', pod.name)[0]
                pods_num[i * 20 + int(pod_type) - 1] += 1
    return pods_num.tolist()


if __name__ == '__main__':
    print(check_running_pod_for_all_name(True, 0))
    print(check_pod('service1', True, True, 0))
    print(check_pod_for_its_node('service6-deployment', 'service6', True, 0))
    print(check_pods_num_for_this_edge_cluster(None, None))
