# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:
# curl http://localhost:4001/predict -X POST -d 'observation=[]'

import os
import flask
import json
import random


def random_pod_offload(arguments):
    nodes_resource = arguments[4]
    pod_list = arguments['pod']
    pod_index = random.randint(0, len(pod_list)-1)
    return pod_list[pod_index]


# CPU
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# initialize our Flask application
app = flask.Flask(__name__)


# observation = ['node_name', ['image_type']]
@app.route("/predict", methods=["POST"])
def predict():
    if flask.request.method == "POST":
        observation = flask.request.form['observation']
        observation = json.loads(observation)
        result = random_pod_offload(argument=observation)
    return flask.jsonify(["result", result])


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=4001, threaded=True)
