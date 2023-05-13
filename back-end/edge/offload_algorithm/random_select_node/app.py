# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:
# curl http://10.244.2.116:4000/predict -X POST -d 'observation=[1,0,2,1,{"cpu":[3.0,2194.916,16384.0,4389.83,4.0,1111.916,12384.0,2489.83],"mem":[3165120.0,5077580.0,1321908.0,2165120.0,2077580.0,1121908.0],"up_time":[4388736.59,17551980.02,4388736.59,17551980.02],"pod":[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]}]'

import os
import flask
import json
import random

"""
0代表云，接下来按照node的名字排列1，2···
返回的是云或者是自己集群里的node编号
"""

# 根据实际情况改动
ACTION_NUM = 3  # 云+边缘节点


def random_node_offload():
    node_index = random.randint(0, ACTION_NUM - 1)
    return node_index


# CPU
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# initialize our Flask application
app = flask.Flask(__name__)


# observation = ['node_name', ['image_type']]
@app.route("/predict", methods=["POST"])
def predict():
    if flask.request.method == "POST":
        observation = flask.request.form["observation"]
        observation = json.loads(observation)
        result = random_node_offload()
    return flask.jsonify(["result", result])


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4000, threaded=True)
