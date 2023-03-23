import asyncio
import csv
import json
import pickle
import time
from sys import float_info

# request_path = './request/batch_task_mini_test.csv'
request_path = './request/poisson_data.csv'

# 输入edge_master的ip
EDGE_MASTER_IP = '192.168.1.30'
EDGE_MASTER_RECEIVE_REQUEST_PORT = 9000

loop = asyncio.get_event_loop()


class ReqData(object):
    def __init__(self, type, start_time, end_time, data=None, execute_standard_time=0, send_system_time=0):
        self.type = int(type)
        self.start_time = int(start_time)
        self.end_time = int(end_time)
        self.execute_standard_time = int(end_time) - int(start_time)
        self.send_system_time = send_system_time

    def __repr__(self):
        return f'ReqData(type={self.type},start_time={self.start_time},end_time={self.end_time},execute_standard_time={self.execute_standard_time},send_system_time={self.send_system_time})'


# 输入：数据集路径
# 输出：请求类别列表、请求时间列表
# 作用：根据数据集生成请求信息

# 不用pillow去打开图片，反正打开了也不用而是通过网络传过去，那打开文件时解码是一个性能损失，把解码过的数据（会比解码前大）传到对面又是一个性能损失
# 而且pillow的Image对象序列化有可能有奇怪的行为
# 直接把二进制流传过去,到对面再把二进制流通过bytesio之类的给pillow解码

def create_req(dataset_path):
    req_data_list = []
    with open(dataset_path, 'r') as f:
        reader = csv.reader(f)
        it = iter(reader)
        next(it)
        for row in it:
            req_data_list.append(ReqData(row[1], row[2], row[3]))
    return req_data_list


async def send_request(req_data):
    reader, writer = await asyncio.open_connection(EDGE_MASTER_IP, EDGE_MASTER_RECEIVE_REQUEST_PORT)
    req_data.send_system_time = time.time()
    data = [req_data.type, req_data.start_time, req_data.end_time, req_data.execute_standard_time,
            req_data.send_system_time]
    data = json.dumps(data)
    writer.write(data.encode('utf-8'))
    writer.close()


async def main_coroutine():
    print('center start')
    # 全部的信息
    req_data_list = create_req(request_path)

    time_offset = loop.time() - req_data_list[0].start_time
    # print(loop.time())
    # print(time.time())

    now_index = 0

    req_data_len = len(req_data_list)

    while now_index < req_data_len:
        time_now = loop.time() - time_offset
        time_to_wait = req_data_list[now_index].start_time - time_now
        if time_to_wait > float_info.epsilon:
            print('waiting for next batch')
            await asyncio.sleep(time_to_wait)
            time_now = loop.time() - time_offset

        print('time now:', time_now)

        last_index = now_index
        max_time = time_now + float_info.epsilon
        while now_index < req_data_len:
            req_data = req_data_list[now_index]
            if req_data.start_time > max_time:
                break
            now_index += 1

        batch_to_send = req_data_list[last_index:now_index]
        print('sending:', batch_to_send)
        await asyncio.gather(*map(send_request, batch_to_send))
        print(f'progress: {now_index}/{req_data_len}')


if __name__ == '__main__':
    loop.run_until_complete(main_coroutine())
