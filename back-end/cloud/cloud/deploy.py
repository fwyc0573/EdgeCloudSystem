import yaml
from kubernetes import client, config, watch
from ruamel import yaml

from .check_pod import check_pod

NAME = ['imagerecon', 'ocr', 'extractinfo', 'facerecognition', 'speechtotext', 'fasttext',
        'textgenrnn', 'simplehtr', 'facemaskdetection', 'extracttable', 'verifycode', 'imageai']

PATH = ['./app/object/service.yaml', './app/ocr/service.yaml', './app/extract-info/service.yaml',
        './app/face-recognition/service.yaml', './app/speech-to-text/service.yaml',
        './app/fast-text/service.yaml', './app/textgenrnn/service.yaml', './app/SimpleHTR/service.yaml',
        './app/FaceMaskDetection/service.yaml', './app/extract-table/service.yaml', './app/easy12306/service.yaml',
        './app/imageAI/service.yaml']


def bind_name(v1, pod, node, namespace="default"):
    target = client.V1ObjectReference(api_version='v1', kind='Node', name=node)
    meta = client.V1ObjectMeta()
    meta.name = pod
    body = client.V1Binding(target=target, metadata=meta)
    try:
        print("INFO Pod: %s placed on: %s\n" % (pod, node))
        print(pod, ' choose node ', node)
        api_response = v1.create_namespaced_pod_binding(
            name=pod, namespace=namespace, body=body)
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
                body=content, namespace="default")
        print("Deployment created. status='%s'" % resp.metadata.name)
    except Exception as e:
        print("Error, when creating pod!!!", e)
        pass
    for x in check_pod('\n'):
        if str(x.name.split('-')[0]).strip() == name and x.status == 'Pending':
            bind_name(v1, str(x.name).strip(), node)
            break
    return 0


def deploy(yaml_path, name, times):
    # 使用
    config.load_kube_config()
    v1 = client.CoreV1Api()

    try:
        with open(yaml_path, encoding="utf-8") as f:
            content = yaml.load(f, Loader=yaml.RoundTripLoader)
            if times != 0:
                content['metadata']['name'] = name + '-deployment' + str(times)
            k8s_apps_v1 = client.AppsV1Api()
            resp = k8s_apps_v1.create_namespaced_deployment(
                body=content, namespace="default")
            print("Service created. status='%s'" % resp.metadata.name)
    except Exception as e:
        print("Error, when creating pod!!!", e)
        pass


def delete(deployment_name):
    config.load_kube_config()
    k8s_apps_v1 = client.AppsV1Api()
    resp = k8s_apps_v1.delete_namespaced_deployment(
        name=deployment_name, namespace="default")
    print("delete deploy ")
    return 0


if __name__ == "__main__":
    # for i in range(11):
    #     deploy(PATH[i], NAME[i], 0)
    deploy(PATH[0], NAME[0], 1)
