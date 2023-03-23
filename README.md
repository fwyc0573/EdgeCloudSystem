# Edg-cloud System

## Introduction
My undergraduate work (awarded Outstanding Final Design), a K8s-based edge cloud system consisting of (i) a front-end based on Rancher and Echarts visualisation with lots of interesting interactive animations, and (ii) multiple back-ends supported by classical, intelligent scheduling algorithms.

## Video demonstration

https://www.bilibili.com/video/BV1ZX4y1o7vh/

<!-- ![screen](https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig.png) -->
<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig.png" width="600" /><br/>


## Project Overview

The cloud edge system architecture is as follows:


<div align=center>
<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig7.png" width="500" /><br/>
</div>

* **Device Side**：The device side is a workload generation. In order to simulate the generation of user requests, the request generation is simulated by using Ali Cloud and other environments as request generators.
* **Edge Side**：Requests received by the edge-side entry access point (eAP) are forwarded by the scheduling algorithm to the edge cluster or cloud cluster for request processing.
* **Cloud Side**：Compared to the edge cluster, the cloud cluster has more powerful computing and processing capabilities, and more complex and intelligent applications are deployed in the cloud.
* **Private Registry**：A private pegistry is configured for the system platform, in which a large number of service images are stored to facilitate the deployment of services in each cluster.
* **System Monitor**：System information such as the number of nodes, resource utilisation, real-time scheduling of tasks, processing of tasks and deployment of containerised services, etc., will all be presented by the front-end.


## Part of the Important Implement and Design

PVE virtual cluster construction:

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fi5.png" width="400" /><br/>
****
Modification and recompilation of Rancher (a K8S monitoring open source architecture)：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig4.png" height="150" />  <img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig2.png" height="150" /><br/>
****
Custom visual web creation based on the Echarts library：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig6.png" width="400" /><br/>
****
Containerisation and deployment of several popular GitHub AI applications：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig3.png" width="400" /><br/>
****
The system back-end contains greedy algorithms for container services and deep reinforcement learning scheduling algorithms：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig1.png" width="400" /><br/>



## Part of the Important Implement and Design

PVE virtual cluster construction:

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fi5.png" width="400" /><br/>
****
Modification and recompilation of Rancher (a K8S monitoring open source architecture)：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig4.png" height="150" />  <img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig2.png" height="150" /><br/>
****
Custom visual web creation based on the Echarts library：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig6.png" width="400" /><br/>
****
Containerisation and deployment of several popular GitHub AI applications：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig3.png" width="400" /><br/>
****
The system back-end contains greedy algorithms for container services and deep reinforcement learning scheduling algorithms：

<img src="https://github.com/fwyc0573/EdgeCloudSystem/blob/main/customizedWeb/fig/fig1.png" width="400" /><br/>

 
