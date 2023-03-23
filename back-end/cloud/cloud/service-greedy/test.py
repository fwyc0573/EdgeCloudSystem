import json

s= ['master',3,{'master':{4:{'success':1,'failure':0},11:{'success':0,'failure':1},8:{'success':1,'failure':0}}},{'master':{'node1':{4:2,11:1},'node2':{8:2}}},{'master':{4:{'stuck':1},11:{'stuck':1},8:{'stuck':1},6:{'stuck':1},2:{'stuck':1},1:{'stuck':2}}},{'master':{'node1':{'memory':'13176956.0Ki','ephemeral-storage':'13176956Ki'},'node2':{'memory':'13176956.0Ki','ephemeral-storage':'13176956Ki'}}},2]
a=json.dumps(s)

["master", 3, {"master": {"4": {"success": 1, "failure": 0}, "11": {"success": 0, "failure": 1}, "8": {"success": 1, "failure": 0}}}, {"master": {"node1": {"4": 2, "11": 1}, "node2": {"8": 2}}}, {"master": {"4": {"stuck": 1}, "11": {"stuck": 1}, "8": {"stuck": 1}, "6": {"stuck": 1}, "2": {"stuck": 1}, "1": {"stuck": 2}}}, {"master": {"node1": {"cpu": {"percent": "2", "number": "100m"}, "memory": {"percent": "19", "number": "3122Mi"}, "storage": {"percent": "4", "number": "6Gi"}}, "node2": {"cpu": {"percent": "2", "number": "100m"}, "memory": {"percent": "26", "number": "4146Mi"}, "storage": {"percent": "6", "number": "8Gi"}}}}, 0]
