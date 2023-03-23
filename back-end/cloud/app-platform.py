import json
import multiprocessing
from multiprocessing import Manager

from flask import Flask, make_response, request

from cloud.cloud import collect_data
from cloud.cloud import execute
from cloud.cloud import update_pod_cloud
from cloud.cloud import collect_tasks_execute_situation_on_each_node
from cloud.cloud import current_service_on_each_node
from cloud.cloud import stuck_tasks_situation_on_each_node
from cloud.cloud import resources_on_each_node
from cloud.cloud import valueclone_nested_dict_proxy

app = Flask(__name__)


@app.route('/ExecuteAll')
def send_data():
    with mdata_lock, share_lock1, share_lock3:
        send_dict = {
            'count': valueclone_nested_dict_proxy(mdata),
            'tasksExecute': valueclone_nested_dict_proxy(manager_tasks_execute_situation_on_each_node_dict),
            'stuckTasks': valueclone_nested_dict_proxy(manager_stuck_tasks_situation_on_each_node_dict),
        }
    print('send_dict----------')
    print(send_dict)
    final_dict = {'count': send_dict['count']}
    temp1 = {}
    tasks_execute_dict = send_dict['tasksExecute']
    for name, value1 in tasks_execute_dict.items():
        temp1[name] = {}
        temp1[name]['success'] = 0
        temp1[name]['failure'] = 0
        for the_type, value2 in value1.items():
            temp1[name]['success'] += value2['success']
            temp1[name]['failure'] += value2['failure']
    temp2 = {}
    stuck_tasks_dict = send_dict['stuckTasks']
    for name, value1 in stuck_tasks_dict.items():
        temp2[name] = len(value1)

    for k, v in temp1.items():
        if temp2[k] is not None:
            temp1[k]['stuck'] = temp2[k]
    final_dict['tasks_all'] = temp1
    print('final_dict----------')
    print(final_dict)
    thisMission = json.dumps(final_dict)
    resp = make_response(thisMission)  # 响应体
    resp.headers["Content-Type"] = "application/json"
    resp.headers["Cache-Control"] = "no-cache"  # 设置响应头
    return resp


@app.route('/algorithmChosen', methods=['post'])
def algorithm_choose():
    if request.data:  # 检测是否有数据
        # params = request.data.decode('utf-8')
        # 获取到POST过来的数据，因为我这里传过来的数据需要转换一下编码。根据晶具体情况而定
        # prams = json.loads(params)
        # 把区获取到的数据转为JSON格式。
        # return jsonify(prams)
        # 返回JSON数据。
        params = request.form
        print('algorithm_choose开始打印了')
        print(params)


if __name__ == '__main__':
    print('!!!!!!!!!!!')
    p1 = multiprocessing.Process(target=execute)
    p1.start()

    # 但你得注意manager.dict并不是一个dict，只是一个用起来像dict的东西。
    # 也就是说你不能直接json.dump它，你得把数据复制到真正的dict里再dump。
    # 而修改dict和读取dict内数据的两个操作可能会同时进行，导致不可预料的问题。你需要加锁以避免两个动作同时发生
    share_lock1 = multiprocessing.Lock()
    share_lock2 = multiprocessing.Lock()
    share_lock3 = multiprocessing.Lock()
    share_lock4 = multiprocessing.Lock()
    mdata_lock = multiprocessing.Lock()
    with Manager() as manager:
        manager_tasks_execute_situation_on_each_node_dict = manager.dict()
        manager_current_service_on_each_node_dict = manager.dict()
        manager_stuck_tasks_situation_on_each_node_dict = manager.dict()
        manager_resources_on_each_node_dict = manager.dict()

        p4 = multiprocessing.Process(target=collect_tasks_execute_situation_on_each_node,
                                     args=(manager_tasks_execute_situation_on_each_node_dict, share_lock1))
        p4.start()

        p5 = multiprocessing.Process(target=current_service_on_each_node,
                                     args=(manager_current_service_on_each_node_dict, share_lock2))
        p5.start()

        p6 = multiprocessing.Process(target=stuck_tasks_situation_on_each_node,
                                     args=(manager_stuck_tasks_situation_on_each_node_dict, share_lock3))
        p6.start()

        p7 = multiprocessing.Process(target=resources_on_each_node, args=(
            manager_resources_on_each_node_dict, share_lock4))
        p7.start()

        p2 = multiprocessing.Process(target=update_pod_cloud,
                                     args=(manager_tasks_execute_situation_on_each_node_dict,
                                           manager_current_service_on_each_node_dict,
                                           manager_stuck_tasks_situation_on_each_node_dict,
                                           manager_resources_on_each_node_dict,
                                           share_lock1, share_lock2, share_lock3, share_lock4))
        p2.start()

        mdata = manager.dict({
            'success': 0,
            'failure': 0,
            'stuck': 0,
        })
        p3 = multiprocessing.Process(target=collect_data, args=(mdata, mdata_lock))
        p3.start()
        app.run(host='0.0.0.0', port=5000)
