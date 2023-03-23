# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:

# curl http://localhost:4001/predict -X POST -d 'observation=["master", 3, {"master": {"4": {"success": 1, "failure": 0}, "11": {"success": 0, "failure": 1}, "8": {"success": 1, "failure": 0}}}, {"master": {"node1": {"4": 2, "11": 1}, "node2": {"8": 2}}}, {"master": {"4": {"stuck": 1}, "11": {"stuck": 1}, "8": {"stuck": 1}, "6": {"stuck": 1}, "2": {"stuck": 1}, "1": {"stuck": 2}}}, {"master": {"node1":{"memory":{"percent":"13","number":"2098Mi"},"storage":{"percent":"3","number":"4Gi"},"cpu":{"percent":"2","number":"100m"}},"node2":{"memory":{"percent":"13","number":"2098Mi"},"storage":{"percent":"3","number":"4Gi"},"cpu":{"percent":"2","number":"100m"}}}}, 0]'
# tasks_execute_situation_on_each_node_dict, current_service_on_each_node_dict,
# stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict, epoch_index]'

import os
import flask
import json
import numpy as np
import re
import csv


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
    total_task_sum = 0

    result = []
    failure_box = [-2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2]
    success_box = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

    # 选第一个参数
    first_dict = tasks_execute_situation_on_each_node_dict[master_name]
    for type in first_dict:
        value = first_dict[type]
        failure_percent = value['failure'] / \
                          (value['success'] + value['failure'])

        # 加上成功失败的
        total_task_sum += value['success'] + value['failure']
        failure_box[int(type) - 1] = failure_percent
        success_box[int(type) - 1] = 1 - failure_percent
    first_param = None

    # 确定是否要删除,每个节点剩余都小于1Gi的话删
    if_delete = True
    second_dict = resources_on_each_node_dict[master_name]
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
        if int(memory_percent) < 90:
            if_delete = False

    if if_delete:
        # 如果要删除，在现有服务中选一个：1.根本没出现 2.失败率最低（成功率最高）
        third_dict = current_service_on_each_node_dict[master_name]
        current_service = []
        for node_name in third_dict:
            fourth_dict = third_dict[node_name]
            for type in fourth_dict:
                current_service.append(int(type))

        l_failure = 1
        for i in current_service:
            if failure_box[i - 1] <= l_failure:
                first_param = i - 1
                l_failure = failure_box[i - 1]

        # 传过来的是0-11，现在要换成1-12传回去
        first_param += 1
        first_param *= -1
    else:
        first_param = 0

    with open('/home/service/greedy/error.csv', 'a+', newline="") as f:
        csv_write = csv.writer(f)
        csv_write.writerow([first_param])  # 记得要改
        f.close()

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
        second_param = 1
        fifth_dict = stuck_tasks_situation_on_each_node_dict[master_name]
        for type in fifth_dict:
            num = fifth_dict[type]['stuck']
            if num > max_stuck:
                max_stuck = num
                second_param = int(type)

    with open('/home/service/greedy/error.csv', 'a+', newline="") as f:
        csv_write = csv.writer(f)
        csv_write.writerow([second_param])  # 记得要改
        csv_write.writerow([master_name])
        f.close()

    success = np.zeros(20).astype(int)
    for key, the_dict in first_dict.items():
        success[int(key) - 1] = the_dict['success']

    reward = success.sum()

    if epoch_index > 0:
        with open('/home/service/greedy/reward_hist.csv', 'a+', newline="") as f2:
            csv_write = csv.writer(f2)
            csv_write.writerow([epoch_index, reward / total_task_sum])  # 记得要改
            f2.close()

    result.append(master_name)
    result.append(first_param)
    result.append(second_param)

    return result


# CPU
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# initialize our Flask application
app = flask.Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():
    if flask.request.method == "POST":
        observation = flask.request.form['observation']
        observation = json.loads(observation)
        result = greedy_algorithm_placement(observation[0], observation[1], observation[2], observation[3],
                                            observation[4], observation[5], observation[6])
    return flask.jsonify(result)


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=4001, threaded=True)
