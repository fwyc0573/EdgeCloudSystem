# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:

# curl http://localhost:4002/predict -X POST -d 'observation=[1,0,2,1,{"cpu":[3.0,2194.916,16384.0,4389.83,4.0,1111.916,12384.0,2489.83],"mem":[3165120.0,5077580.0,1321908.0,2165120.0,2077580.0,1121908.0],"up_time":[4388736.59,17551980.02,4388736.59,17551980.02],"pod":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]}]'

import csv
import os
import pickle
import flask
import json
import numpy as np

import torch
import torch.nn as nn
import torch.nn.functional as F

###########################################参数###########################################
EP_STEPS = 200
LR_A = 0.001  # actor学习率
LR_C = 0.002  # critic学习率
GAMMA = 0.9  # reward discount
TAU = 0.01  # soft replacement
MEMORY_CAPACITY = 10000
BATCH_SIZE = 32

# 根据实际情况改动
ACTION_NUM = 3  # 云+边缘节点
CPU_PARAM_LEN = 4
MEM_PARAM_LEN = 3
UPTIME_PARAM_LEN = 2
POD_PARAM_LEN = 20

# 这里是共有两个node，参数暂定，可修改
s_dim = (CPU_PARAM_LEN + MEM_PARAM_LEN + UPTIME_PARAM_LEN) * (
    ACTION_NUM - 1
) + POD_PARAM_LEN * ACTION_NUM
a_dim = 1


###########################################DDPG Framework##########################################
class ANet(nn.Module):  # 定义网络结构
    def __init__(self, s_dim, a_dim):
        super(ANet, self).__init__()
        self.fc1 = nn.Linear(s_dim, 30)
        self.fc1.weight.data.normal_(0, 0.1)  # 初始化fc1
        self.out = nn.Linear(30, a_dim)
        self.out.weight.data.normal_(0, 0.1)  # 初始化out

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = F.tanh(self.out(x))
        actions = x * 2  # 范围是0-2,取整
        return actions


class CNet(nn.Module):  # 定义网络结构
    def __init__(self, s_dim, a_dim):
        super(CNet, self).__init__()
        self.fcs = nn.Linear(s_dim, 30)
        self.fcs.weight.data.normal_(0, 0.1)  # 初始化fcs
        self.fca = nn.Linear(a_dim, 30)
        self.fca.weight.data.normal_(0, 0.1)  # 初始化fca
        self.out = nn.Linear(30, 1)
        self.out.weight.data.normal_(0, 0.1)  # 初始化out

    def forward(self, s, a):
        x = self.fcs(s)
        y = self.fca(a)
        actions = self.out(F.relu(x + y))
        return actions


class DDPG(object):
    def __init__(self, a_dim, s_dim):
        self.a_dim, self.s_dim = a_dim, s_dim
        self.var = 3  # 在训练期间的exploration（会逐渐减少）
        self.ep_r = 0
        self.memory = np.zeros(
            (MEMORY_CAPACITY, s_dim * 2 + a_dim + 1), dtype=np.float32
        )
        self.pointer = 0  # 更新memory data的时候使用
        # 4个网络
        self.Actor_eval = ANet(s_dim, a_dim)
        self.Actor_target = ANet(s_dim, a_dim)
        self.Critic_eval = CNet(s_dim, a_dim)
        self.Critic_target = CNet(s_dim, a_dim)

        # 给actor和critic建立两个optimizer
        self.actor_optimizer = torch.optim.Adam(self.Actor_eval.parameters(), lr=LR_A)
        self.critic_optimizer = torch.optim.Adam(self.Critic_eval.parameters(), lr=LR_C)

        # critic network更新时的loss function
        self.loss_td = nn.MSELoss()

    def choose_action(self, s):
        s = torch.unsqueeze(torch.FloatTensor(s), 0)
        return self.Actor_eval(s)[0].detach()  # ae(s)

    def learn(self):
        # soft 更新target network
        for x in self.Actor_target.state_dict().keys():
            eval("self.Actor_target." + x + ".data.mul_((1-TAU))")
            eval(
                "self.Actor_target."
                + x
                + ".data.add_(TAU*self.Actor_eval."
                + x
                + ".data)"
            )
        for x in self.Critic_target.state_dict().keys():
            eval("self.Critic_target." + x + ".data.mul_((1-TAU))")
            eval(
                "self.Critic_target."
                + x
                + ".data.add_(TAU*self.Critic_eval."
                + x
                + ".data)"
            )

        # sample a mini-batch
        indices = np.random.choice(MEMORY_CAPACITY, size=BATCH_SIZE)
        bt = self.memory[indices, :]
        bs = torch.FloatTensor(bt[:, : self.s_dim])
        ba = torch.FloatTensor(bt[:, self.s_dim : self.s_dim + self.a_dim])
        br = torch.FloatTensor(bt[:, -self.s_dim - 1 : -self.s_dim])
        bs_ = torch.FloatTensor(bt[:, -self.s_dim :])

        # 做动作
        a = self.Actor_eval(bs)
        q = self.Critic_eval(bs, a)  # loss=-q=-ce(s,ae(s)) 更新ae ae(s)=a ae(s_)=a_

        # 如果a是一个正确的行为的话，那么Q应该更接近0
        loss_a = -torch.mean(q)

        # 更新actor-network
        self.actor_optimizer.zero_grad()
        loss_a.backward()
        self.actor_optimizer.step()

        # 使用next_state 计算target-Q 的值
        a_ = self.Actor_target(bs_)  # 不及时更新参数，用于预测Critic的Q-target中的action
        q_ = self.Critic_target(bs_, a_)  # 不及时更新参数，用于给出Actor更新参数时的Gradient descent强度
        q_target = br + GAMMA * q_

        q_v = self.Critic_eval(bs, ba)

        # td_error=R+GAMMA*ct(bs_,at(bs_)) -ce(s,ba)更新ce，但这个ae（s）是记忆中的ba，让ce得出的Q靠近Q_target，让评价更准确
        td_error = self.loss_td(q_target, q_v)

        self.critic_optimizer.zero_grad()
        td_error.backward()
        self.critic_optimizer.step()

        return loss_a, td_error

    def store_transition(self, s, a, r, s_):  # 存储每个回合的数据
        transition = np.hstack((s, a, [r], s_))
        index = self.pointer % MEMORY_CAPACITY  # 使用新的memory替换旧的
        self.memory[index, :] = transition
        self.pointer += 1


def calc_reward(if_success, req_type, total_time):  # 注意传进来的参数类型
    reward = 0
    if if_success != 0:
        # 根据超过时间大小来计算reward
        reward += 1 - (total_time - (req_type + 1)) / (req_type + 1)
    else:
        reward = -1
    return reward


def dqn_node_offload(arguments):
    epoch_index = arguments[0]
    req_type = arguments[3]
    nodes_resource = arguments[4]

    # 确保这里的node是按顺序排的
    # 有两个node,要将参数进行处理并且归一化
    cpu_list = nodes_resource["cpu"]
    mem_list = nodes_resource["mem"]
    up_time_list = nodes_resource["up_time"]
    pod_list = nodes_resource["pod"]

    # cpu
    cpu = np.array(cpu_list).astype(float)
    # mem
    mem = np.array(mem_list).astype(float)
    # up_time
    up_time = np.array(up_time_list).astype(float)
    # 云的pod在最后
    pod = np.array(pod_list).astype(float)

    s = np.concatenate((cpu, mem, up_time, pod))

    if epoch_index == 1:
        ddpg = DDPG(a_dim, s_dim)
    else:
        if not os.path.exists("/home/service/dqn-node-offload"):
            os.makedirs("/home/service/dqn-node-offload")

        ddpg_path = "/home/service/dqn-node-offload/ddpg_pickled.txt"
        with open(ddpg_path, "rb") as f:
            try:
                ddpg = pickle.load(f)
            except Exception as e:
                raise  # 处理不了的 Exception 应该继续抛出，防止后面的代码被执行
            finally:
                f.close()

    not_proper = True
    a = 2

    while not_proper:
        # 得到action
        a = ddpg.choose_action(s)
        a = round(np.clip(np.random.normal(a, ddpg.var), 0, 2)[0])
        a = np.array([a])

        r = -1
        if pod[a * POD_PARAM_LEN + req_type - 1] != 0:
            not_proper = False

        s_ = np.concatenate((cpu, mem, up_time, pod))
        ddpg.store_transition(s, a, r, s_)  # 存储记忆

    if not os.path.exists("/home/service/dqn-node-offload"):
        os.makedirs("/home/service/dqn-node-offload")
    with open("/home/service/dqn-node-offload/ddpg_pickled.txt", "wb") as f:
        pickle.dump(ddpg, f)
        f.close()
    return a.item()


def store_feedback(arguments):
    epoch_index = arguments[0]
    req_type = arguments[1]
    if_success = arguments[2]
    execute_time = arguments[3]

    loss_a, td_error = 0, 0

    ddpg_path = "/home/service/dqn-node-offload/ddpg_pickled.txt"
    with open(ddpg_path, "rb") as f:
        try:
            ddpg = pickle.load(f)
        except Exception as e:
            raise  # 处理不了的 Exception 应该继续抛出，防止后面的代码被执行
        finally:
            f.close()

    # 计算reward并存进去
    r = calc_reward(if_success, req_type, execute_time)
    ddpg.memory[epoch_index][s_dim + a_dim] = r

    # if there are enough transitions, perform learning
    if ddpg.pointer > MEMORY_CAPACITY:
        ddpg.var *= 0.9995  # decay the exploration controller factor
        loss_a, td_error = ddpg.learn()

    ddpg.ep_r += r
    print(
        "Episode: ", epoch_index, " Reward: %i" % ddpg.ep_r, "Explore: %.2f" % ddpg.var
    )

    if epoch_index >= BATCH_SIZE:
        with open(
            "/home/service/dqn-node-offload/loss_hist.csv", "a+", newline=""
        ) as f1:
            csv_write = csv.writer(f1)
            csv_write.writerow([epoch_index, loss_a, td_error])
            f1.close()

    # record the reward
    if epoch_index > 1:
        with open(
            "/home/service/dqn-node-offload/reward_hist.csv", "a+", newline=""
        ) as f2:
            csv_write = csv.writer(f2)
            csv_write.writerow([epoch_index, r])  # 记得要改
            f2.close()

    with open("/home/service/dqn-node-offload/ddpg_pickled.txt", "wb") as f:
        pickle.dump(ddpg, f)
        f.close()


# CPU
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# initialize our Flask application
app = flask.Flask(__name__)


@app.route("/predict", methods=["POST"])
def predict():
    observation = flask.request.form["observation"]
    observation = json.loads(observation)
    result = dqn_node_offload(observation)
    return flask.jsonify(["result", result])


@app.route("/feedback", methods=["POST"])
def feedback():
    observation = flask.request.form["observation"]
    observation = json.loads(observation)
    store_feedback(observation)


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4002, threaded=True)
