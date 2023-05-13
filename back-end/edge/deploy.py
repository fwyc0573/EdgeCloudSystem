from os import path
import yaml
from kubernetes import client, watch, config
import random
from check_pod import check_pod
import time
from ruamel import yaml


def bind_name(v1, pod, node, namespace="default"):
    target = client.V1ObjectReference(api_version="v1", kind="Node", name=node)
    meta = client.V1ObjectMeta()
    meta.name = pod
    body = client.V1Binding(target=target, metadata=meta)
    try:
        print("INFO Pod: %s placed on: %s\n" % (pod, node))
        print(pod, " choose node ", node)
        api_response = v1.create_namespaced_pod_binding(
            name=pod, namespace=namespace, body=body
        )
        print(api_response)
        return api_response
    except Exception as e:
        print("Warning when calling CoreV1Api->create_namespaced_pod_binding: %s\n" % e)


# 输入：pod配置信息
# 输出：无
# 作用：部署pod
def deploy_with_node(yaml_path, node, name):
    config.load_kube_config()
    v1 = client.CoreV1Api()
    w = watch.Watch()
    try:
        with open(yaml_path, encoding="utf-8") as f:
            content = yaml.load(f, Loader=yaml.RoundTripLoader)
            # 修改yml文件中的参数
            # content['spec']['replicas']= 2
            # content['metadata']['name']= 'try'
            # content['spec']['template']['spec']['containers'][0]='name={}'.format('0.0.0.0')

            # dep = yaml.safe_load(content)
            k8s_apps_v1 = client.AppsV1Api()
            resp = k8s_apps_v1.create_namespaced_deployment(
                body=content, namespace="default"
            )
        print("Deployment created. status='%s'" % resp.metadata.name)
    except Exception as e:
        print("Error, when creating pod!!!", e)
        pass
    for x in check_pod("\n"):
        if str(x.name.split("-")[0]).strip() == name and x.status == "Pending":
            bind_name(v1, str(x.name).strip(), node)
            break
    return 0


def deploy(yaml_path, name):
    # 使用
    config.load_kube_config()
    v1 = client.CoreV1Api()

    try:
        with open(yaml_path, encoding="utf-8") as f:
            content = yaml.load(f, Loader=yaml.RoundTripLoader)
            content["metadata"]["name"] = name
            k8s_apps_v1 = client.AppsV1Api()
            resp = k8s_apps_v1.create_namespaced_deployment(
                body=content, namespace="default"
            )
            print("Service created. status='%s'" % resp.metadata.name)
    except Exception as e:
        print("Error, when creating pod!!!", e)
        pass


def delete(deployment_name):
    config.load_kube_config()
    k8s_apps_v1 = client.AppsV1Api()
    resp = k8s_apps_v1.delete_namespaced_deployment(
        name=deployment_name, namespace="default"
    )
    print("delete deploy " + deployment_name)
    return time.time()
