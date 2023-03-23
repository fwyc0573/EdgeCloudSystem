# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:

# curl http://localhost:4002/predict -X POST -d 'observation=["master", 3, {"master": {"4": {"success": 1, "failure": 0}, "11": {"success": 0, "failure": 1}, "8": {"success": 1, "failure": 0}}}, {"master": {"node1": {"4": 2, "11": 1}, "node2": {"8": 2}}}, {"master": {"4": {"stuck": 1}, "11": {"stuck": 1}, "8": {"stuck": 1}, "6": {"stuck": 1}, "2": {"stuck": 1}, "1": {"stuck": 2}}}, {"master": {"node1": {"memory": "13176956.0Ki", "ephemeral-storage": "13176956Ki"}, "node2": {"memory": "13176956.0Ki", "ephemeral-storage": "13176956Ki"}}}, 2]'
# tasks_execute_situation_on_each_node_dict, current_service_on_each_node_dict,
# stuck_tasks_situation_on_each_node_dict, resources_on_each_node_dict, epoch_index]'

import os
import flask
import json
import numpy as np
import re
import pickle
import csv
import time
import random
import torch as t
from torch.autograd import Variable
from torch import nn


class BasicModule(t.nn.Module):
    """
    封装了nn.Module,主要是提供了save和load两个方法
    """

    def __init__(self):
        super(BasicModule, self).__init__()
        self.model_name = str(type(self))

    def load(self, path):
        """
        可加载指定路径的模型
        """
        self.load_state_dict(t.load(path))

    def save(self, name=None):
        """
        保存模型，默认使用“模型名字+时间”作为文件名
        """
        if name is None:
            prefix = 'checkpoints/' + self.model_name + '_'
            name = time.strftime(prefix + '%m%d_%H:%M:%S.pth')

        t.save(self.state_dict(), name)
        return name

    def get_optimizer(self, lr, weight_decay):
        return t.optim.Adam(self.parameters(), lr=lr, weight_decay=weight_decay)


class SimpleNet(BasicModule):
    def __init__(self, state_size, action_size=420):
        super(SimpleNet, self).__init__()
        self.model_name = 'SimpleNet'
        self.fc1 = nn.Linear(state_size, 200)
        self.fc1.weight.data.normal_(mean=0, std=0.1)
        self.fc2 = nn.Linear(200, action_size)
        self.fc2.weight.data.normal_(mean=0, std=0.1)

        self.classifier = nn.Sequential(
            self.fc1,
            nn.ReLU(),
            self.fc2
        )

    def forward(self, x):
        action = self.classifier(x)
        return action


class DQNAgent:
    def __init__(self, state_size, action_size, replay_memory_size, mini_batch_size, replace_target_period,
                 gamma, epsilon=1.0, epsilon_min=0.01, epsilon_decrement=0.001, learning_rate=0.005):
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


def calc_reward(success_t, total_task_sum):
    if total_task_sum == 0:
        return t.sum(success_t, dim=1) 
    else:
        success_t = t.sum(success_t, dim=1) * 100 / total_task_sum
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
    Dict::   边缘master名字->边缘worker的名字->memory
    resources_on_each_node: 各节点内存使用情况
    {'master':{'node1':{'memory':{'percent':'13','number':'2098Mi'},'storage':{'percent':'3','number':'4Gi'},'cpu':{'percent':'2','number':'100m'}},'node2':{'memory':{'percent':'13','number':'2098Mi'},'storage':{'percent':'3','number':'4Gi'},'cpu':{'percent':'2','number':'100m'}}}
    :return:
    1.待编排的节点：选2个所有边缘集群的node。
    2.对节点的操作：选出是增加还是删除某个类型的服务
    [-MAX_KIND，MAX_KIND]
    [-MAX_KIND，MAX_KIND]
    """
    total_task_sum = 0
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
        success[int(key) - 1] = the_dict['success']
        failure[int(key) - 1] = the_dict['failure']

    total_task_sum = np.sum(success) + np.sum(failure)

    for key1, value1 in param2.items():
        for key2, value2 in value1.items():
            service[int(key2) - 1] += value2

    for key, the_dict in param3.items():
        stuck[int(key) - 1] = the_dict['stuck']

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
        if not os.path.exists('/home/service/dqn-simplenet'):
            os.makedirs('/home/service/dqn-simplenet')

        agent_path = '/home/service/dqn-simplenet/agent_pickled.txt'
        with open(agent_path, 'rb') as f:
            try:
                agent = pickle.load(f)
            except Exception as e:
                raise  # 处理不了的 Exception 应该继续抛出，防止后面的代码被执行
            finally:
                f.close()

    # 得到state状态，tensor形式
    control_action = agent.act(current_state)

    # 得到加减
    next_delete, next_add = obtain_actual_action(CONTROL_ACTION_MAP, control_action)

    # get the reward，tensor形式
    the_success = current_state[:, :20]
    reward = calc_reward(the_success, total_task_sum)

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
        with open('/home/service/dqn-simplenet/loss_hist.csv', 'a+', newline="") as f1:
            csv_write = csv.writer(f1)
            csv_write.writerow([epoch_index, cur_loss.item()])
            f1.close()

    # record the reward
    if epoch_index > 0:
        with open('/home/service/dqn-simplenet/reward_hist.csv', 'a+', newline="") as f2:
            csv_write = csv.writer(f2)
            csv_write.writerow([epoch_index, reward.item() / 100])  # 记得要改
            f2.close()

    if not os.path.exists('/home/service/dqn-simplenet'):
        os.makedirs('/home/service/dqn-simplenet')
    with open('/home/service/dqn-simplenet/agent_pickled.txt', 'wb') as f:
        pickle.dump(agent, f)
        f.close()

    result = [master_name, next_delete * (-1), next_add]

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
        result = q_learning_placement(observation[0], observation[1], observation[2], observation[3],
                                      observation[4], observation[5], observation[6])
    return flask.jsonify(result)


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=4002, threaded=True)
