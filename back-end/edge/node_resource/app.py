# USAGE
# Start the server:
# 	python app.py
# Submit a request via cURL:
#  curl http://localhost:7000/resource
import os
import time
import flask
import json
import re


# /proc/cpuinfo　　cpu的信息
def cpuinfo():
    info = os.popen('cat /proc/cpuinfo').read().split('\n')
    result = {}
    for i in range(len(info)):
        if info[i].find('\t: ') == -1:
            continue
        result[info[i].split('\t: ')[0]] = info[i].split('\t: ')[1]

    cpu_list = [float(result["processor"]), float(result["cpu MHz\t"]),
                float(re.findall(r'\d+\.?\d*', result["cache size"])[0]), float(result["bogomips"])]
    return cpu_list


# /proc/meminfo 　　RAM使用的相关信息
def meminfo():
    info = os.popen('cat /proc/meminfo').read().split('\n')
    result = {}
    for i in range(len(info)):
        if info[i].find(':        ') == -1:
            continue
        result[info[i].split(':        ')[0]] = info[i].split(':        ')[1].strip()

    mem_list = [float(re.findall(r'\d+\.?\d*', result['MemFree'])[0]),
                float(re.findall(r'\d+\.?\d*', result['Cached'])[0]), float(re.findall(r'\d+\.?\d*', result['Active'])[0])]
    return mem_list


# /proc/uptime　　系统已经运行了多久
def uptime():
    info = os.popen('cat /proc/uptime').read().split(' ')
    # run time,idle time
    result = [float(info[0].strip()), float(info[1].strip())]
    return result


def check_status():
    result = []
    if not os.path.exists('./node_status_info/'):
        os.makedirs('./node_status_info/')

    with open('./node_status_info/cpu_' + str(time.time()) + '.json', 'w') as file_obj:
        cpu = cpuinfo()
        json.dump(cpu, file_obj)
        result.append(cpu)

    with open('./node_status_info/mem_' + str(time.time()) + '.json', 'w') as file_obj:
        mem = meminfo()
        json.dump(mem, file_obj)
        result.append(mem)

    with open('./node_status_info/uptime_' + str(time.time()) + '.json', 'w') as file_obj:
        up_time = uptime()
        json.dump(up_time, file_obj)
        result.append(up_time)
    return result


# CPU
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# initialize our Flask application and the Keras model
app = flask.Flask(__name__)


# 返回:{'cpu':[],'mem':[],'up_time':[]}
# []中按照顺序依次是需要的几项
@app.route("/resource", methods=["GET"])
def predict():
    if flask.request.method == "GET":
        result = check_status()
    return flask.jsonify(result)


# if this is the main thread of execution first load the model and
# then start the server
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7000, threaded=True)
