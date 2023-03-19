/*
* CloudLineArr->云端内部连线
* DataArr->除云端外的连线
* allArr->Master和Node
* erArr->边缘Master与Center
* sanArr->边缘Node
* CloudNodeArr->云node
*/
var [DataArr, CloudLineArr, allArr, erArr, sanArr, CloudNodeArr] = [[], [], [], [], [], []];

//拓扑结点的数据信息（三类不同结点的属性example）
var items = [
    { name: 'Center', pointType: "Center", where: "End", symbol: "", cpuOccRate: "0%", memoOccRate: "0%", resOccRate: "0%", requestList: [] },
    // {name: 'Master', value: 177, pointType:"Master", belong:"Center", where:"Edge", symbol:"",cpuOccRate:"21%", memoOccRate:"32%", resOccRate:"23%",requestList:[],},
    // {name: 'Node', value: 50, pointType:"Node", belong:"Master_a", where:"Edge", symbol:"",cpuOccRate:"21%", memoOccRate:"32%", resOccRate:"23%",requestList:[],mirrorList:[]},
]

//4类结点的SymbolSize
var centerSymbolSize = [52, 40];
var masterSymbolSize = [40, 25];
var nodeSymbolSize = 6;
var cloudSymbolSize = [25, 15];
//左右云集群入口坐标
var cloudEnterPos1 = [127.6, 36];
var cloudEnterPos2 = [84.4, 36];

//单击后列表icon（包含基础信息和各类服务、镜像icon）
const deviceIcon = '<img src="image/Bluetooth.png" alt=""/>';
const occIcon = '<img src="image/Timer.png" alt=""/>';
const mirrorIcon = '<img src="image/Extension.png" alt=""/>';
const requestIcon = '<img src="image/Colours.png" alt=""/>';
const cloInterIcon = '<img src="image/CloudInterface.png" alt=""/>';
const app1Icon = '<img src="image/app1.png" alt=""/>';
const app2Icon = '<img src="image/app2.png" alt=""/>';
const app3Icon = '<img src="image/app3.png" alt=""/>';
const app4Icon = '<img src="image/app4.png" alt=""/>';

//服务、镜像dic（key为images），根据后期提供的服务情况更新
var appDict = { app1: app1Icon, app2: app2Icon, app3: app3Icon, app4: app4Icon };

//平台资源占用情况
var dataArr = [
    { value: 0, name: '内存占用率' },
    { value: 0, name: 'CPU占用率' },
    { value: 0, name: '资源占用率' }
];


//折线图数据
const data = { fir: [], sec: [], thi: [], };

var shadowGraphData = [];//阴影折线图数据

var center = [106, 36];//中心坐标
var tempData = [];//实时服务拓扑连线数组，需要为每个数据进行series的设置

$(function () {
    $.ajaxSettings.async = false;//设置为同步加载
    $.get('json/china.json', function (chinaJson) {
        echarts.registerMap('china', chinaJson);
    });


    //模拟百数量级边缘侧Master结点和Node结点
    // 记得到时候试一下
    // addData_Center(items);
    addData_Master(items);
    addData_Node(items);
    classifyItems();

    erArr = group(erArr, erArr.length);//内圈Mater结点
    sanArr = group(sanArr, 10);//外圈1Node结点
    CloudNodeArr = CloudGroup(CloudNodeArr, 17);//云Node结点

    allArr = [...erArr, ...sanArr, ...CloudNodeArr];

    DataArr = linesConfig([...erArr, ...sanArr]);// 线坐标和配置
    CloudLineArr = linesConfig_cloud();

    //统计Node和Master数量
    var masterNum = erArr.length - 1;
    //这里以后可能要改
    var nodeNum = sanArr.length + CloudNodeArr.length;
    $("#masterNum").html(masterNum);
    $("#nodeNum").html(nodeNum);

    map();
    resource();
    task();
    cluster_graph1();
    cluster_graph2();
    cluster_graph3();
    cluster_graph4();
    // console.log(erArr);
});


function addData_Center(items) {
    $.ajax({
        //nodes信息
        url: '/request',
        headers: {
            'Accept': 'application/json'
        },
        success: function (value) {
            items[0]['cpuOccRate'] = value['cpuOccRate'];
            items[0]['memoOccRate'] = value['memoOccRate'];
            items[0]['resOccRate'] = value['resOccRate'];
        }
    })
}

//模拟边缘侧Master结点
function addData_Master(items) {
    $.ajax({
        url: '/v3/nodes',
        headers: {
            'Accept': 'application/json'
        },
        success: function (value1) {
            let arg1 = value1['data'];
            let clusters = new Map();
            arg1.forEach((element, index) => {
                let clusterId = element.clusterId;
                let obj;
                if (clusters.has(clusterId)) {
                    obj = clusters.get(clusterId);
                } else {
                    obj = {};
                }

                let ifWorker = element.worker;
                let nodeName = element.nodeName;

                if (ifWorker) {
                    if (obj.worker) {
                        obj.worker.push(nodeName)
                    } else {
                        let tmp = new Array();
                        tmp.push(nodeName)
                        obj.worker = tmp;
                    }
                } else {
                    obj.master = nodeName
                }
                clusters.set(clusterId, obj);
            })

            clusters.forEach(function (cluster, nameOfCluster) {
                let name_ = cluster.master;
                if (name_.indexOf("cloud") != -1) return;
                let pointType_ = "Master";
                let where_ = "Edge";
                let belong_ = "Center";


                //新增CPU、内存、资源占用率、请求缓存队列、镜像列表
                let cpuOccRate_ = "";
                let memoOccRate_ = "";
                let resOccRate_ = "";
                let requestList_ = [];

                items.push({
                    name: name_,
                    pointType: pointType_,
                    belong: belong_,
                    where: where_,
                    cpuOccRate: cpuOccRate_,
                    memoOccRate: memoOccRate_,
                    resOccRate: resOccRate_,
                    requestList: requestList_,
                })

                //边缘侧结点
                let workers = cluster.worker;
                if (workers) {
                    let workersLen = workers.length;
                    for (let i = 0; i < workersLen; i++) {
                        //写worker名字
                        let name_node = workers[i];
                        let pointType_node = "Node";
                        let belong_node = name_;
                        let requestList_ = [];
                        let mirrorList_ = [];
                        items.push({
                            name: name_node,
                            pointType: pointType_node,
                            belong: belong_node,
                            where: where_,
                            cpuOccRate: cpuOccRate_,
                            memoOccRate: memoOccRate_,
                            resOccRate: resOccRate_,
                            requestList: requestList_,
                            mirrorList: mirrorList_,
                        })

                    }

                }
            })
        }
    })
    // for(var i=0;i<10;i++)
    // {
    //     var name_ = "Master_" + i;
    //     var pointType_= "Master";
    //     var where_ = "Edge";
    //     var belong_ = "Center";

    //     //新增CPU、内存、资源占用率、请求缓存队列、镜像列表
    //     var cpuOccRate_ = "";
    //     var memoOccRate_ = "";
    //     var resOccRate_ = "";
    //     var requestList_ = [];
    //     items.push({
    //         name:name_,
    //         pointType:pointType_,
    //         belong:belong_,
    //         where:where_,
    //         cpuOccRate:cpuOccRate_,
    //         memoOccRate:memoOccRate_,
    //         resOccRate:resOccRate_,
    //         requestList:requestList_,
    //     })

    //     //边缘侧结点
    //     var randomSonNodeNum = Math.round(Math.random() * 5+2)//每个Master随机2~6个node
    //     for(var j=0;j<randomSonNodeNum;j++)
    //     {
    //         var name_node = "Node_" + 5*i+j;
    //         var pointType_node= "Node";
    //         var belong_node = name_;
    //         var requestList_ = [];
    //         var mirrorList_ = [];
    //         items.push({
    //             name:name_node,
    //             pointType:pointType_node,
    //             belong:belong_node,
    //             where:where_,
    //             cpuOccRate:cpuOccRate_,
    //             memoOccRate:memoOccRate_,
    //             resOccRate:resOccRate_,
    //             requestList:requestList_,
    //             mirrorList: mirrorList_,

    //         })
    //     }
    // }
    return items;
}

//模拟云端Node结点，因为云集群的mirror和request一致，所以给一样的地址即可（这样赋值调用MirReqDataAdd()的时候可以通过一个数值同步所有云结点）。
function addData_Node(items) {
    var requestList_ = [];
    var mirrorList_ = [];

    $.ajax({
        url: '/v3/nodes',
        headers: {
            'Accept': 'application/json'
        },
        success: function (value1) {
            let arg1 = value1['data'];
            let clusters = new Map();
            arg1.forEach((element, index) => {
                let clusterId = element.clusterId;
                let obj;
                if (clusters.has(clusterId)) {
                    obj = clusters.get(clusterId);
                } else {
                    obj = {};
                }

                let ifWorker = element.worker;
                let nodeName = element.nodeName;

                if (ifWorker) {
                    if (obj.worker) {
                        obj.worker.push(nodeName)
                    } else {
                        let tmp = new Array();
                        tmp.push(nodeName)
                        obj.worker = tmp;
                    }
                } else {
                    obj.master = nodeName
                }
                clusters.set(clusterId, obj);
            })

            clusters.forEach(function (cluster, nameOfCluster) {
                let name_ = cluster.master;
                if (name_.indexOf("cloud") != -1) {

                    let workers = cluster.worker;
                    if (workers) {
                        let workersLen = workers.length;
                        for (let i = 0; i < workersLen; i++) {
                            //写worker名字
                            let pointType_ = "Node";
                            let where_ = "Cloud";
                            let belong_ = "Center";
                            let cpuOccRate_ = "";
                            let memoOccRate_ = "";
                            let resOccRate_ = "";
                            name_ = workers[i];

                            items.push({
                                name: name_,
                                pointType: pointType_,
                                belong: belong_,
                                where: where_,
                                cpuOccRate: cpuOccRate_,
                                memoOccRate: memoOccRate_,
                                resOccRate: resOccRate_,
                                requestList: requestList_,
                                mirrorList: mirrorList_,
                            })

                        }

                    }
                }
            })
        }
    })

    // for(var i=0;i<10;i++)
    // {
    //     var index = 810 + i;
    //     var name_ = "Node_" + index;
    //     var pointType_= "Node";
    //     var where_ = "Cloud";
    //     var belong_ = "Center";
    //     var cpuOccRate_ = "";
    //     var memoOccRate_ = "";
    //     var resOccRate_ = "";
    //     items.push({
    //         name:name_,
    //         pointType:pointType_,
    //         belong:belong_,
    //         where:where_,
    //         cpuOccRate:cpuOccRate_,
    //         memoOccRate:memoOccRate_,
    //         resOccRate:resOccRate_,
    //         requestList:requestList_,
    //         mirrorList: mirrorList_,
    //     })
    // }
    return items;
}

//各类结点分类处理
function classifyItems() {
    items.forEach((el, ind) => {
        if (el.pointType === "Master") {
            el.symbol = 'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAgCAYAAABO6BuSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpFMzhFMDM4REEwQUYxMUVBQkY1NEIzNTg4MTM4RjIxOCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpFMzhFMDM4RUEwQUYxMUVBQkY1NEIzNTg4MTM4RjIxOCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkUzOEUwMzhCQTBBRjExRUFCRjU0QjM1ODgxMzhGMjE4IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkUzOEUwMzhDQTBBRjExRUFCRjU0QjM1ODgxMzhGMjE4Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+ZMccrwAACbZJREFUeNrkWUtvJFcV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';
            el.symbolSize = masterSymbolSize;
            el.label = {
                normal: {
                    show: false,
                    position: "bottom",
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: [4, 8, 4, 8],
                    distance: 10,
                    color: "rgb(255,255,255)",
                    borderColor: "rgb(89,197,238)",
                },
            };
            erArr.push(el);
        } else if (el.pointType === "Node" && el.where === "Edge") {
            //Node类型
            el.itemStyle = {
                borderColor: el.pointColor ? el.pointColor : 'rgba(4, 242, 28, 0)',
                borderWidth: 3,
                color: "#0ceffd",
            };
            sanArr.push(el);
        } else if (el.pointType === "Node" && el.where === "Cloud") {
            el.symbol = "image://data:image/png;base64,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";
            el.symbolSize = cloudSymbolSize;
            //Node类型
            el.itemStyle = {
                borderColor: el.pointColor ? el.pointColor : 'rgba(100, 242, 28, 0)',
                borderWidth: 3,
                color: "#0ceffd",
            };
            CloudNodeArr.push(el);
        }
        else if (el.pointType === "Center") {
            el.symbol = "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAyCAYAAAAA9rgCAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF6WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjAtMTEtMjFUMjI6MzQ6MTkrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIwLTExLTIxVDIyOjQyOjIyKzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTExLTIxVDIyOjQyOjIyKzA4OjAwIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmZjYjZkYWZiLWRmN2EtNDk0Yi1hMmQ5LTA3ZTFmMzljMzQ0YiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QkMzRkE4QkEwQUYxMUVBOUZEREI0QzdBNDdFMjJDQSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjdCQzNGQThCQTBBRjExRUE5RkREQjRDN0E0N0UyMkNBIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6N0JDM0ZBODhBMEFGMTFFQTlGRERCNEM3QTQ3RTIyQ0EiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6N0JDM0ZBODlBMEFGMTFFQTlGRERCNEM3QTQ3RTIyQ0EiLz4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmNiNmRhZmItZGY3YS00OTRiLWEyZDktMDdlMWYzOWMzNDRiIiBzdEV2dDp3aGVuPSIyMDIwLTExLTIxVDIyOjQyOjIyKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+WACrBQAACEZJREFUaIHtmsuPHFcVxn+nqrpnpqdnPC+PYzuYEYTEhFgIJUqEghBISAgQSLACsWIBfwgrxIIdgoWFhITYsEMKSxBsQsjCAiuJldgmjvErHjJ4PK/uqnsOi3Oru93TVT2OuyE8PulOdd+6fet895x7HrdGdnd3mSR+/LsWJpzBuIaAxH6r/skrF29y/qWza+cBvnJpEzH46bf3JioXQKvVIpn0pIqTM/EPqt4s9qv5IOv3vWCBH375tc2vAVjw8dPC5AkraIjNomat32caFyX2AeSQmvGLL13c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";
            el.symbolSize = centerSymbolSize;
            erArr.push(el);
        }
        el.children = [];//子数组
        if (!el.belong || el.belong === 'Center') {
            // el.children = [];
            items.forEach((es) => {
                if (es.belong === el.name) {
                    el.children.push(es);//每一个父节点的children数组
                }
            });
            allArr.push(el);
        }
    });
}

//电磁炉圆形布局
function group(arr, r) {
    const newArray = [];
    const { length: arLen } = arr;
    arr.forEach((e, ind) => {
        // 按角度均匀分布
        const ang = 90 - (360 / arLen).toFixed(8) * (ind + 1);
        let x = 0;
        let y = 0;
        if (e.pointType === "Node") {
            x = (1.2 * Math.cos(ang * Math.PI / 180)).toFixed(5) * r + center[0];
            y = (Math.sin(ang * Math.PI / 180)).toFixed(5) * r + center[1];
        }
        else if (e.pointType === "Master") {
            x = (1.2 * Math.cos(ang * Math.PI / 180)).toFixed(5) * r + center[0];
            y = (Math.sin(ang * Math.PI / 180)).toFixed(5) * r + center[1];
        }
        else if (e.pointType === "Center") {
            x = center[0];
            y = center[1];
        }
        //对应geo坐标
        e.value = [x.toFixed(4), y.toFixed(4)];
        newArray.push(e);
    });
    // console.log(newArray);
    return newArray;
}

//CLOUD CLUSTER---电磁炉圆形布局(要插入左右两个固定的两个全新的接口node，需要提前根据云集群结点的数量进行插入位置的计算)
function CloudGroup(arr, r) {
    const newArray = [];
    const { length: arLen } = arr;
    const eachAng = (360 / arLen).toFixed(3);
    var bias = 0;//偏移项，防止接口与云node重合
    var firPos = 1;
    var secPos = 1;

    if (!360 % length) {
        bias = 23;
    }
    while (90 - firPos * eachAng > 0) {
        firPos++;
    }
    while (270 - secPos * eachAng > 0) {
        secPos++;
    }

    arr.forEach((e, ind) => {
        if (ind == firPos - 1) {
            //插入对应的接入口
            var cloudInterface = {
                name: "cloudEnter_A",
                pointType: "Interface",
                where: "Cloud",
                symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAACKklEQVRIicWWTUgVURTHf6aVubHI0tAWRh+0EDRqE4EoQisRhBaSqwgMTBeF4MrdaxG2KFOiZeHOIggVzJWuow+MamG5CFcuoijtg4oj/4nDdd57g298/mGYmTMfv3PvPfecUzI4/5WUtBv4kfRXOwpkVgDXgb/Ams4Pgca0wPuBQWABmAPagKPAN2A4eLcbeAH05vphWQLoKeB5YHuW4Lu7wBfNwAblG3EpMJsAkk0PgJrNgM8B+woAm3qSgks1vf3A2QKhpstxxnCNLYimgTMpACPVAdeAKeBdZAxHfDtlaKRbwFtgIA58ELi4BVCvm8B5Dy4Hjm8xNNIIUGlrXAl8TCF6k+oY8NlGPFRE6H8ZuKvYUARe2i5wZrvAk8DVInPvR9tpVKlyT8xhmWcCqAqe7QXGVR693Wr0PaXbuP/tsvztU+YfFXMvc+Yp0KQOo0PFPnLWEk4rUO+6D2sMrug4AKzEDTlfdbohqKldOdd0SYfpEDCm65agMZiR8xuUq+c6AizG2OuVcEI1qfMIdUFLlXjEH4BOd9+r9VvS+b17ZvcvlXpPO/tIHDQfuAF47O6fAKu6Xg3e/aWzrfMrZ+8LnM8KPqmmznqq185u5Ww5h5Nev9UMRnqk2ch4u1/jMue514TWKZQV9ROy7RTQq1/1PdRh4JMfsW2nMPSbs0BNts1Mb2KgpjtyLAy49S0bRrVt8FpN6/csQC+r4RZsP/O8Z0mjWrGxAvAP4uhluPRvm9AAAAAASUVORK5CYII=",
                symbolSize: [23, 20],
            }
            // let x = (1.2*Math.cos(0 * Math.PI / 180)).toFixed(5) * r+center[0];
            // let y = (Math.sin(0 * Math.PI / 180)).toFixed(5) * r+center[1];
            //对应geo坐标
            cloudInterface.value = cloudEnterPos1;
            // console.log(cloudInterface.value);
            cloudInterface.itemStyle = {
                borderWidth: 3,
                color: "#8A2BE2",
            };
            newArray.push(cloudInterface);
        }
        else if (ind == secPos - 1) {
            //插入对应的接入口
            var cloudInterface = {
                name: "cloudEnter_B",
                pointType: "Interface",
                where: "Cloud",
                symbol: "image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAbCAYAAABr/T8RAAACKklEQVRIicWWTUgVURTHf6aVubHI0tAWRh+0EDRqE4EoQisRhBaSqwgMTBeF4MrdaxG2KFOiZeHOIggVzJWuow+MamG5CFcuoijtg4oj/4nDdd57g298/mGYmTMfv3PvPfecUzI4/5WUtBv4kfRXOwpkVgDXgb/Ams4Pgca0wPuBQWABmAPagKPAN2A4eLcbeAH05vphWQLoKeB5YHuW4Lu7wBfNwAblG3EpMJsAkk0PgJrNgM8B+woAm3qSgks1vf3A2QKhpstxxnCNLYimgTMpACPVAdeAKeBdZAxHfDtlaKRbwFtgIA58ELi4BVCvm8B5Dy4Hjm8xNNIIUGlrXAl8TCF6k+oY8NlGPFRE6H8ZuKvYUARe2i5wZrvAk8DVInPvR9tpVKlyT8xhmWcCqAqe7QXGVR693Wr0PaXbuP/tsvztU+YfFXMvc+Yp0KQOo0PFPnLWEk4rUO+6D2sMrug4AKzEDTlfdbohqKldOdd0SYfpEDCm65agMZiR8xuUq+c6AizG2OuVcEI1qfMIdUFLlXjEH4BOd9+r9VvS+b17ZvcvlXpPO/tIHDQfuAF47O6fAKu6Xg3e/aWzrfMrZ+8LnM8KPqmmznqq185u5Ww5h5Nev9UMRnqk2ch4u1/jMue514TWKZQV9ROy7RTQq1/1PdRh4JMfsW2nMPSbs0BNts1Mb2KgpjtyLAy49S0bRrVt8FpN6/csQC+r4RZsP/O8Z0mjWrGxAvAP4uhluPRvm9AAAAAASUVORK5CYII=",
                symbolSize: [23, 20],
            }
            // let x = (1.2*Math.cos(180 * Math.PI / 180)).toFixed(5) * r+center[0];
            // let y = (Math.sin(180 * Math.PI / 180)).toFixed(5) * r+center[1];
            //对应geo坐标
            cloudInterface.value = cloudEnterPos2;
            // console.log(cloudInterface.value);
            newArray.push(cloudInterface);
        }

        // 按角度均匀分布
        const ang = 90 - eachAng * (ind + 1);
        let x = 0;
        let y = 0;
        if (e.pointType === "Node" || e.pointType === "Master") {
            x = (1.2 * Math.cos((ang + bias) * Math.PI / 180)).toFixed(5) * r + center[0];
            y = (Math.sin((ang + bias) * Math.PI / 180)).toFixed(5) * r + center[1];
        }
        else if (e.pointType === "Center") {
            x = center[0];
            y = center[1];
        }
        //对应geo坐标
        e.value = [x.toFixed(4), y.toFixed(4)];
        newArray.push(e);
    });
    // console.log(newArray);
    return newArray;
}

//新添加了云集群的连线(最外圈)
function linesConfig_cloud() {
    const DataArr = [];
    for (var i = 0; i < CloudNodeArr.length; i++) {
        // console.log(CloudNodeArr[i].value);
        // console.log(CloudNodeArr[i].name);

        if (i == CloudNodeArr.length - 1) {
            DataArr.push([
                { coord: CloudNodeArr[i].value },
                { coord: CloudNodeArr[0].value },
                { name: CloudNodeArr[i].name + CloudNodeArr[0].name },
            ]);
        }
        else {
            DataArr.push([
                { coord: CloudNodeArr[i].value },
                { coord: CloudNodeArr[i + 1].value },
                { name: CloudNodeArr[i].name + CloudNodeArr[i + 1].name },
            ]);
        }
    }
    return DataArr;
}

//连线配置
function linesConfig(arr) {
    const [DataArr, targetCoord] = [[], center];
    arr.forEach((el) => {
        if (el.belong === "Center") {
            DataArr.push([
                { coord: targetCoord },
                { coord: el.value },
                { name: "Center" + el.name },
            ]);
            arr.forEach((element) => {
                if (element.belong === el.name) {
                    DataArr.push([
                        { coord: el.value },
                        { coord: element.value },
                        { name: el.name + element.name },
                    ]);
                }
            });
        }
    });

    // console.log(DataArr);
    // console.log(DataArr[0][2].name);
    return DataArr;
}

//中心拓扑网络（新修正了tooltip和geo中的初始zoom大小）
function map() {
    var myChart = echarts.init(document.getElementById('map'));
    var mp3 = new Audio("music/bo.mp3");
    option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'click',
            hideDelay: 1,
            transitionDuration: 0,
            alwaysShowContent: false,
            formatter: function (o) {
                mp3.play();

                if (o.data.pointType === "Node") {
                    var req = "";//请求服务数据
                    for (var i = 0; i < o.data.requestList.length; i++) {
                        if (!(i % 4) && i)
                            req += "&nbsp;&nbsp;&nbsp;&nbsp;" + '<br>';
                        req += appDict[o.data.requestList[i]] + '<span>' + o.data.requestList[i] + '</span>';
                    }
                    var mir = "";//镜像数据

                    for (var i = 0; i < o.data.mirrorList.length; i++) {
                        if (!(i % 4) && i)
                            mir += "&nbsp;&nbsp;&nbsp;&nbsp;" + '<br>';
                        mir += appDict[o.data.mirrorList[i]] + '<span>' + o.data.mirrorList[i] + '</span>';
                    }

                    return '<div class="device me">' + deviceIcon + '<span>' + "设备名称：" + '</span>' + '<span style="color:#76EEC6;">' + o.name + '<br>' + '</span>'
                        + occIcon + '<span >' + "CPU占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.cpuOccRate + '<br>' + '</span>'
                        + occIcon + '<span>' + "内存占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.memoOccRate + '<br>' + '</span>'
                        + occIcon + '<span>' + "资源占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.resOccRate + '<br>' + '</span>' + '<br>'
                        + mirrorIcon + '<span>' + "镜像列表：" + '<br>' + '</span>'
                        + '<div class="pic">' + mir + '<br>' + '<br>' + '</div>'
                        + requestIcon + '<span>' + "请求队列：" + '<br>' + '</span>'
                        + '<div class="pic">' + req + '<br>' + '<br>' + '</div>' + '</div>'
                        ;
                }
                else if (o.data.pointType === "Master" || o.data.pointType === "Center") {
                    var req = "";//请求服务数据
                    for (var i = 0; i < o.data.requestList.length; i++) {
                        if (!(i % 4) && i)
                            req += "&nbsp;&nbsp;&nbsp;&nbsp;" + '<br>';
                        req += appDict[o.data.requestList[i]] + '<span>' + o.data.requestList[i] + '</span>';
                    }
                    return '<div class="device me">' + deviceIcon + '<span>' + "设备名称：" + '</span>' + '<span style="color:#76EEC6;">' + o.name + '<br>' + '</span>'
                        + occIcon + '<span >' + "CPU占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.cpuOccRate + '<br>' + '</span>'
                        + occIcon + '<span>' + "内存占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.memoOccRate + '<br>' + '</span>'
                        + occIcon + '<span>' + "资源占用率：" + '</span>' + '<span style="color:#76EEC6;">' + o.data.resOccRate + '<br>' + '</span>' + '<br>'
                        + requestIcon + '<span>' + "请求队列：" + '<br>' + '</span>'
                        + '<div class="pic">' + req + '<br>' + '<br>' + '</div>' + '</div>'
                        ;
                }
                else if (o.data.pointType === "Interface") {
                    return '<div class="device me">' + cloInterIcon + '<span>' + "云集群请求处理入口" + "&nbsp;&nbsp;&nbsp" + '</span>' + '</div>';
                }
            }
        },
        geo: {
            map: 'china',
            show: true,
            roam: true,
            //center: [100, 34],  //初始化中心点坐标
            zoom: 1.2,
            label: {
                emphasis: {
                    show: false
                }
            },
            scaleLimit: { //滚轮缩放的极限控制
                min: 1.2,
                max: 6,
            },
            itemStyle: {
                normal: {
                    color: 'rgba(22,22,2,0)',
                    areaColor: 'rgba(22,22,2,0)',
                    borderColor: 'rgba(22,22,2,0)'
                },
                emphasis: {
                    color: 'rgba(22,22,2,0)',
                    areaColor: 'rgba(22,22,2,0)',
                    borderColor: 'rgba(22,22,2,0)'
                }
            }
        },
        series:
            //getSeries(tempData),
            [
                {
                    // name: '设备信息',
                    zlevel: 1,
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: allArr,
                    symbolSize: nodeSymbolSize,
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: false
                        },
                        emphasis: {
                            show: true,
                        }
                    },
                },
                {
                    name: '连接路线',
                    type: "lines",
                    coordinateSystem: 'geo',
                    polyline: false,
                    z: 1,
                    zlevel: 1,
                    animation: false,
                    effect: {
                        show: false,
                    },
                    lineStyle: {
                        normal: {
                            color: "rgba(55,155,255,0.5)",
                            width: 0.95,
                            curveness: 0.2,
                            opacity: 0.7,
                        }
                    },
                    data: DataArr,
                },
                {
                    name: '连接路线2',
                    type: "lines",
                    coordinateSystem: 'geo',
                    polyline: false,
                    z: 1,
                    zlevel: 1,
                    animation: false,
                    effect: {
                        show: false,
                    },
                    lineStyle: {
                        normal: {
                            color: "rgba(55,155,255,0.5)",
                            width: 2,
                            curveness: 0.2,
                            opacity: 0.7,
                        }
                    },
                    data: CloudLineArr,
                },

                //边缘端Master类动画
                {
                    name: 'MASTER',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: erArr,
                    symbolSize: 15,
                    showEffectOn: 'emphasi',
                    rippleEffect: {
                        scale: 2,
                        // period:5,
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    itemStyle: {
                        normal: {
                            color: '#f4e925',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                },
                //边缘端Node动画
                {
                    name: 'MASTER2',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: sanArr,
                    symbolSize: 1.9,
                    showEffectOn: 'emphasi',//render
                    rippleEffect: {
                        brushType: 'stroke',
                        scale: 6
                    },
                    hoverAnimation: true,
                    itemStyle: {
                        normal: {
                            color: '#f4e925',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                },
                //云端Node动画
                {
                    name: 'MASTER3',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: CloudNodeArr,
                    symbolSize: 1.9,
                    showEffectOn: 'emphasi',//render
                    rippleEffect: {
                        brushType: 'stroke',
                        scale: 2
                    },
                    hoverAnimation: true,
                    itemStyle: {
                        normal: {
                            color: '#f4e925',
                            shadowBlur: 5,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                },
            ]
    }
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
}
//左下侧资源图表
function resource() {
    var myChart = echarts.init(document.getElementById('resource'));

    var color = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
        {
            offset: 0,
            color: '#5CF9FE' // 0% 处的颜色
        },
        {
            offset: 0.17,
            color: '#468EFD' // 100% 处的颜色
        },
        {
            offset: 0.9,
            color: '#468EFD' // 100% 处的颜色
        },
        {
            offset: 1,
            color: '#5CF9FE' // 100% 处的颜色
        }
    ]);
    var colorSet = [
        [dataArr[0].value, color],
        [1, '#15337C']
    ];
    var rich_fir = {
        white: {
            fontSize: 20,
            color: '#fff',
            fontWeight: '350',
            padding: [-64, -8, 0, 10]
        },
        bule: {
            fontSize: 35,
            fontFamily: 'DINBold',
            color: '#fff',
            fontWeight: '550',
            padding: [-38, -8, 0, 0],
        },
        //下方小框框
        radius: {
            width: 90,
            height: 25,
            // lineHeight:80,
            borderWidth: 1,
            borderColor: '#0092F2',
            fontSize: 14,
            fontWeight: '550',
            color: '#fff',
            backgroundColor: '#1B215B',
            borderRadius: 35,
            textAlign: 'center',
        },
        size: {
            height: 22,
            padding: [80, 0, 0, 0]
        }
    }

    option = {
        series: [
            //饼图_fir
            {
                zlevel: 1.5,
                type: 'gauge',
                name: '外层辅助',
                radius: '33%',
                center: ['47%', '25%'],
                startAngle: '225',
                endAngle: '-45',
                splitNumber: '100',
                pointer: {
                    show: false
                },
                detail: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                            [1, '#00FFFF']
                        ],
                        width: 2,
                        opacity: 0.6
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        color: '#051932',
                        width: 0,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                },
                itemStyle: {
                    emphasis: {
                        show: false,
                    }
                },
            },
            {
                zlevel: 1.5,
                type: 'gauge',
                radius: '30%',
                startAngle: '225',
                endAngle: 225 - 270 / 100 * dataArr[0].value,
                center: ['47%', '25%'],
                pointer: {
                    show: false
                },
                detail: {
                    formatter: function (value) {
                        var num = Math.round(dataArr[0].value);
                        return '{bule|' + num + '}{white|%}' + '{size|' + '}\n{radius|内存占用率}';
                    },
                    rich: rich_fir,
                    "offsetCenter": ['0%', "0%"],
                },
                data: dataArr,
                title: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colorSet,
                        width: 13,
                        // shadowBlur: 15,
                        // shadowColor: '#B0C4DE',
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        opacity: 1
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false,
                    length: 25,
                    lineStyle: {
                        color: '#00377a',
                        width: 2,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                },
                itemStyle: {
                    emphasis: {
                        show: false,
                    }
                },
            },
            //饼图_sec,
            {
                zlevel: 1.5,
                type: 'gauge',
                name: '外层辅助',
                radius: '33%',
                center: ['47%', '55%'],
                startAngle: '225',
                endAngle: '-45',
                splitNumber: '100',
                pointer: {
                    show: false
                },
                detail: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                            [1, '#00FFFF']
                        ],
                        width: 2,
                        opacity: 0.6
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        color: '#051932',
                        width: 0,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                },
                itemStyle: {
                    emphasis: {
                        show: false,
                    }
                },
            },
            {
                zlevel: 1.5,
                type: 'gauge',
                radius: '30%',
                startAngle: '225',
                endAngle: 225 - 270 / 100 * dataArr[1].value,
                center: ['47%', '55%'],
                pointer: {
                    show: false
                },
                detail: {
                    formatter: function (value) {
                        var num = Math.round(dataArr[1].value);
                        return '{bule|' + num + '}{white|%}' + '{size|' + '}\n{radius|CPU占用率}';
                    },
                    rich: rich_fir,
                    "offsetCenter": ['0%', "0%"],
                },
                data: dataArr,
                title: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colorSet,
                        width: 13,
                        // shadowBlur: 15,
                        // shadowColor: '#B0C4DE',
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        opacity: 1
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false,
                    length: 25,
                    lineStyle: {
                        color: '#00377a',
                        width: 2,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                },
                itemStyle: {
                    emphasis: {
                        show: false,
                    }
                },
            },
            //饼图_third
            {
                zlevel: 1.5,
                type: 'gauge',
                name: '外层辅助',
                radius: '33%',
                center: ['47%', '85%'],
                startAngle: '225',
                endAngle: '-45',
                splitNumber: '100',
                pointer: {
                    show: false
                },
                detail: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [
                            [1, '#00FFFF']
                        ],
                        width: 2,
                        opacity: 0.6
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    length: 20,
                    lineStyle: {
                        color: '#051932',
                        width: 0,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                }
            },
            {
                zlevel: 1.5,
                type: 'gauge',
                radius: '30%',
                startAngle: '225',
                endAngle: 225 - 270 / 100 * dataArr[2].value,
                center: ['47%', '85%'],
                pointer: {
                    show: false
                },
                detail: {
                    formatter: function (value) {
                        var num = Math.round(dataArr[2].value);
                        return '{bule|' + num + '}{white|%}' + '{size|' + '}\n{radius|资源占用率}';
                    },
                    rich: rich_fir,
                    "offsetCenter": ['0%', "0%"],
                },
                data: dataArr,
                title: {
                    show: false,
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: colorSet,
                        width: 13,
                        // shadowBlur: 15,
                        // shadowColor: '#B0C4DE',
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        opacity: 1
                    }
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false,
                    length: 25,
                    lineStyle: {
                        color: '#00377a',
                        width: 2,
                        type: 'solid',
                    },
                },
                axisLabel: {
                    show: false
                },
            },
        ]


    }
    myChart.setOption(option);
}
//右下侧折线图
function task() {
    var myChart = echarts.init(document.getElementById('task'));

    option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['请求失败', '请求成功', '积压任务'],
            z: 1.5,
            zlevel: 1.5,
            textStyle: {
                color: "#fff",
                fontSize: 12
            },
            left: '15%',
            right: '2%',
            bottom: '3%',
            top: '0%',
        },
        grid: {
            left: '5%',
            right: '4%',
            bottom: '5%',
            top: '10%',
            containLabel: true
        },

        xAxis: [{
            type: 'time',   // x轴为 时间轴
            // 坐标起点不从零开始
            axisLine: {
                onZero: false
            },
            axisLabel: {
                textStyle: {
                    color: '#a8aab0',
                    fontStyle: 'normal',
                    fontFamily: '微软雅黑',
                    fontSize: 12,
                }
            },
            nameLocation: "center",
            nameTextStyle: {
                fontWeight: "bold",
                fontSize: "15"
            },
            boundaryGap: false,
            splitLine: {
                show: false
            },
            data: data['fir'].map(function (item) {
                return item[0]
            })
        }],

        // 	dataZoom: [
        //     {
        //         show: true,
        //         realtime: true,
        // 		height: 13,//这里可以设置dataZoom的尺寸
        //         start: 10,
        //         end: 100
        //     },
        //     {
        //         type: 'inside',
        //         realtime: true,
        // 		height: 13,//这里可以设置dataZoom的尺寸
        //         start: 10,
        //         end: 100
        //     }
        // ],
        yAxis: [{
            type: 'value',
            splitNumber: 4,
            axisTick: {
                show: false
            },
            //轴线上的字
            axisLabel: {
                textStyle: {
                    fontSize: '12',
                    color: '#cecece'
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#397cbc'
                }
            },
            //网格线
            splitLine: {
                lineStyle: {
                    color: '#11366e'
                }
            }
        }],

        series: [
            //折线图-蓝色
            {
                name: '请求失败',
                type: 'line',
                z: 1.5,
                zlevel: 1.5,
                smooth: true, //是否平滑曲线显示
                showSymbol: false,
                itemStyle: {
                    color: '#3eb5dd',
                    borderColor: '#f1f1f1',
                    borderWidth: 1
                },
                lineStyle: {
                    normal: {
                        width: 1.5,
                        color: {
                            type: 'linear',

                            colorStops: [{
                                offset: 0,
                                color: '#57b3e5' // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: '#31a9ea' // 100% 处的颜色
                            }
                            ],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(249,165,137, 0.5)',
                        shadowBlur: 30,
                        shadowOffsetY: 5
                    }
                },
                areaStyle: {
                    //区域填充样式
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0,
                            0,
                            0,
                            1,
                            [{
                                offset: 0,
                                color: "rgba(58,182,224, 0.6)"
                            }, {
                                offset: 0.6,
                                color: "rgba(58,182,224, 0.2)"
                            },
                            {
                                offset: 0.8,
                                color: "rgba(58,182,224, 0.01)"
                            }
                            ],
                            false
                        ),
                        shadowColor: "rgba(58,182,224, 0.1)",
                        shadowBlur: 6
                    }
                },
                data: data['fir']

            },
            {
                name: '请求成功',
                type: 'line',
                z: 1.5,
                zlevel: 1.5,
                smooth: true, //是否平滑曲线显示
                showSymbol: false,
                itemStyle: {
                    color: '#ff6b71',
                    borderColor: '#f1f1f1',
                    borderWidth: 1
                },
                lineStyle: {
                    normal: {
                        width: 1.5,
                        color: {
                            type: 'linear',

                            colorStops: [{
                                offset: 0,
                                color: '#ff874b' // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: '#ff6b71' // 100% 处的颜色
                            }
                            ],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(255,107,113, 0.5)',
                        shadowBlur: 12,
                        shadowOffsetY: 5
                    }
                },
                areaStyle: {
                    //区域填充样式
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0,
                            0,
                            0,
                            1,
                            [{
                                offset: 0,
                                color: "rgba(255,107,113, 0.6)"
                            },
                            {
                                offset: 0.6,
                                color: "rgba(255,107,113, 0.2)"
                            },
                            {
                                offset: 1,
                                color: "rgba(255,107,113, 0.01)"
                            }
                            ],
                            false
                        ),
                        shadowColor: "rgba(255,107,113, 0.4)",
                        shadowBlur: 6
                    }
                },
                data: data['sec']
            },
            {
                name: '积压任务',
                type: 'line',
                z: 1.5,
                zlevel: 1.5,
                smooth: true, //是否平滑曲线显示
                showSymbol: false,
                itemStyle: {
                    color: '#9999FF',
                    borderColor: '#f1f1f1',
                    borderWidth: 1
                },
                lineStyle: {
                    normal: {
                        width: 1.5,
                        color: {
                            type: 'linear',

                            colorStops: [{
                                offset: 0,
                                color: '#CCCCFF' // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: '#330066' // 100% 处的颜色
                            }
                            ],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(255,107,113, 0.5)',
                        shadowBlur: 12,
                        shadowOffsetY: 5
                    }
                },
                areaStyle: {
                    //区域填充样式
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0,
                            0,
                            0,
                            1,
                            [{
                                offset: 0,
                                color: "rgba(255,107,113, 0.6)"
                            },
                            {
                                offset: 0.6,
                                color: "rgba(255,107,113, 0.2)"
                            },
                            {
                                offset: 1,
                                color: "rgba(255,107,113, 0.01)"
                            }
                            ],
                            false
                        ),
                        shadowColor: "rgba(255,107,113, 0.4)",
                        shadowBlur: 6
                    }
                },
                data: data['thi']
            },
        ]
    }
    myChart.setOption(option);
    window.addEventListener("resize", function () {
        myChart.resize();
    });
}

//集群信息
// var clusterGroup = [
//     { name: 'Cluster1', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster2', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster3', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster4', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster5', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster6', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
//     { name: 'Cluster7', mask_Overstock: 0, mask_Success: 0, mask_Default: 0, mask_Whole: 0, cpuOccRate: 0, memoOccRate: 0, resOccRate: 0 },
// ];


var clusterGroup_MASK = [
    { name: 'Cluster1', mask_Overstock: 5, mask_Success: 10, mask_Default: 2, mask_Whole: 0 },
    { name: 'Cluster2', mask_Overstock: 3, mask_Success: 13, mask_Default: 1, mask_Whole: 0 },
    { name: 'Cluster3', mask_Overstock: 2, mask_Success: 10, mask_Default: 3, mask_Whole: 0 },
    { name: 'Cluster4', mask_Overstock: 5, mask_Success: 15, mask_Default: 2, mask_Whole: 0 },
    { name: 'Cluster5', mask_Overstock: 1, mask_Success: 12, mask_Default: 6, mask_Whole: 0 },
    { name: 'Cluster6', mask_Overstock: 2, mask_Success: 8, mask_Default: 1, mask_Whole: 0 },
    { name: 'Cluster7', mask_Overstock: 3, mask_Success: 19, mask_Default: 3, mask_Whole: 0 },
];


var clusterGroup_RES = [
    { name: 'Cluster1', cpuOccRate: 0.21, memoOccRate: 0.32, resOccRate: 0.23 },
    { name: 'Cluster2', cpuOccRate: 0.32, memoOccRate: 0.42, resOccRate: 0.25 },
    { name: 'Cluster3', cpuOccRate: 0.41, memoOccRate: 0.31, resOccRate: 0.26 },
    { name: 'Cluster4', cpuOccRate: 0.23, memoOccRate: 0.62, resOccRate: 0.12 },
    { name: 'Cluster5', cpuOccRate: 0.55, memoOccRate: 0.12, resOccRate: 0.17 },
    { name: 'Cluster6', cpuOccRate: 0.32, memoOccRate: 0.31, resOccRate: 0.19 },
    { name: 'Cluster7', cpuOccRate: 0.12, memoOccRate: 0.22, resOccRate: 0.30 },
]


/*
* 根据集群信息分别将数据分组打包方便Echarts API取用数据
* */
//集群的Name数组
var clusterGroupName = [];//集群name
//三类任务数量数组
var mask_Overstock = [];//积压任务
var mask_Success = [];//成功任务
var mask_Default = [];//失败任务
var mask_Whole = [];//任务总数

// function clusterData() {
//     for (var i = 0; i < clusterGroup.length; i++) {
//         clusterGroupName.push(clusterGroup[i].name);
//         mask_Overstock.push(clusterGroup[i].mask_Overstock);
//         mask_Success.push(clusterGroup[i].mask_Success);
//         mask_Default.push(clusterGroup[i].mask_Default);

//         var wholeMask = clusterGroup[i].mask_Overstock + clusterGroup[i].mask_Success + clusterGroup[i].mask_Default;
//         mask_Whole.push(wholeMask);
//     }

//     //根据 clusterGroupName 生成 option
//     var selectData = "";
//     for (var i = 0; i < clusterGroupName.length; i++) {
//         selectData += "<option>" + clusterGroupName[i] + "</option>";
//     }
//     $("#cluster_option").html(selectData);
// }
// clusterData();

function clusterData(do_clusterChange) {
    for (var i = 0; i < clusterGroup_MASK.length; i++) {

        clusterGroupName.push(clusterGroup_MASK[i].name);
        mask_Overstock.push(clusterGroup_MASK[i].mask_Overstock);
        mask_Success.push(clusterGroup_MASK[i].mask_Success);
        mask_Default.push(clusterGroup_MASK[i].mask_Default);

        var wholeMask = clusterGroup_MASK[i].mask_Overstock + clusterGroup_MASK[i].mask_Success + clusterGroup_MASK[i].mask_Default;
        mask_Whole.push(wholeMask);
    }
    if (do_clusterChange) {
        //根据 clusterGroupName 生成 option
        var selectData = "";
        for (var i = 0; i < clusterGroupName.length; i++) {
            selectData += "<option>" + clusterGroupName[i] + "</option>";
        }
        $("#cluster_option").html(selectData);
    }

}
clusterData(true);

//集群资源占用情况,初始化时默认为第一个集群
var show_cpuOccRate = clusterGroup_RES[0].cpuOccRate;
var show_memoOccRate = clusterGroup_RES[0].memoOccRate;
var show_resOccRate = clusterGroup_RES[0].resOccRate;

function sum(num) {
    return mask_Overstock[num] + mask_Success[num] + mask_Default[num];
}

function cluster_graph1() {
    var myChart = echarts.init(document.getElementById('cluster_1'));

    option = {
        "tooltip": {
            "axisPointer": {
                "type": "shadow",
                textStyle: {
                    color: "#fff"
                }
            },
        },
        "grid": {
            left: '1%',
            right: '5%',
            bottom: '2%',
            top: '2%',
            containLabel: true,
            textStyle: {
                color: "#fff"
            }
        },
        "calculable": true,
        "xAxis": [{
            "type": "value",
            "trigger": "axis",

            "splitLine": {
                "show": false
            },
            "axisTick": {
                "show": false
            },
            "splitArea": {
                "show": false
            },
            //轴线上的字
            axisLabel: {
                textStyle: {
                    color: '#a8aab0',
                    fontStyle: 'normal',
                    fontFamily: '微软雅黑',
                    fontSize: 12,
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#a4a8b4',
                }
            },
        }],
        "yAxis": [{
            "type": "category",
            "splitLine": {
                "show": false
            },
            axisTick: {
                show: false
            },
            //轴线上的字
            axisLabel: {
                textStyle: {
                    color: '#a8aab0',
                    fontStyle: 'normal',
                    fontFamily: '微软雅黑',
                    fontSize: 12,
                }
            },
            axisLine: {
                lineStyle: {
                    color: '#a4a8b4',
                }
            },
            "splitArea": {
                "show": false
            },
            data: clusterGroupName,
        }],
        "series": [{
            "name": "任务积压数量",
            "type": "bar",
            "stack": "总量",
            barWidth: 13,
            barGap: 0.2,//柱间距离
            "itemStyle": {
                "normal": {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                        offset: 0,
                        color: 'rgba(171,200,139, 1)'
                    }, {
                        offset: 1,
                        color: 'rgba(171,200,139, 0)'
                    }])
                }
            },
            label: {
                normal: {
                    show: true,
                    position: 'insideRight',
                    offset: [-5, 1],
                    formatter: function (params) {
                        return Math.round(params.value / sum(params.dataIndex) * 100) + "%"
                    },
                    textStyle: {
                        align: 'center',
                        baseline: 'middle',
                        fontSize: 10,
                        fontWeight: '250',
                        color: '#fff',
                        textShadowColor: '#000',
                        textShadowBlur: '0',
                        textShadowOffsetX: 1,
                        textShadowOffsetY: 1,
                    }
                },
            },
            "data": mask_Overstock,
        },
        {
            "name": "任务失败数量",
            "type": "bar",
            "stack": "总量",
            "itemStyle": {
                "normal": {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                        offset: 0,
                        color: 'rgba(24,191,207,1)'
                    }, {
                        offset: 1,
                        color: 'rgba(24,191,207,0)'
                    }]),
                    borderColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                        offset: 0,
                        color: 'rgba(24,191,207,1)'
                    }, {
                        offset: 1,
                        color: 'rgba(24,191,207,0)'
                    }]),
                }
            },
            label: {
                normal: {
                    show: true,
                    position: 'insideRight',
                    offset: [-5, 1],
                    formatter: function (params) {
                        return Math.round(params.value / sum(params.dataIndex) * 100) + "%"
                    },
                    textStyle: {
                        align: 'center',
                        baseline: 'middle',
                        fontSize: 10,
                        fontWeight: '250',
                        color: '#fff',
                        textShadowColor: '#000',
                        textShadowBlur: '0',
                        textShadowOffsetX: 1,
                        textShadowOffsetY: 1,
                    }
                },
            },
            "data": mask_Default
        },
        {
            "name": "任务成功数量",
            "type": "bar",
            "stack": "总量",
            "itemStyle": {
                "normal": {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                        offset: 0,
                        color: 'rgba(98,113,228,1)'
                    }, {
                        offset: 1,
                        color: 'rgba(40,54,117,0)'
                    }]),
                    borderColor: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{
                        offset: 0,
                        color: 'rgba(98,113,228,1)'
                    }, {
                        offset: 1,
                        color: 'rgba(40,54,117,0)'
                    }]),
                    "barBorderRadius": 0,
                }
            },
            label: {
                normal: {
                    show: true,
                    position: 'insideRight',
                    offset: [-5, 1],
                    formatter: function (params) {
                        // console.log(params);
                        return Math.round(params.value / sum(params.dataIndex) * 100) + "%"
                    },
                    textStyle: {
                        align: 'center',
                        baseline: 'middle',
                        fontSize: 10,
                        fontWeight: '250',
                        color: '#fff',
                        textShadowColor: '#000',
                        textShadowBlur: '0',
                        textShadowOffsetX: 1,
                        textShadowOffsetY: 1,
                    }
                },
            },
            "data": mask_Success
        }
        ]
    }
    myChart.setOption(option);
}

function cluster_graph2() {
    var myChart = echarts.init(document.getElementById('cluster_2'));

    option = {
        // backgroundColor: '#292c33',
        title: [{
            text: parseInt(show_memoOccRate * 100) + "%",
            left: '49%',
            top: '21%',
            textAlign: 'center',
            textStyle: {
                fontSize: '17',
                fontWeight: '600',
                color: 'rgba(58,182,224, 1)',
                textAlign: 'center',
            },
        }, {
            text: '内存占用率',
            left: '49%',
            top: '28%',
            textAlign: 'center',
            textStyle: {
                fontSize: '9.7',
                fontWeight: '250',
                color: 'rgba(255,255,255, .95)',
                textAlign: 'center',
            },
        },
        //2
        {
            text: parseInt(show_cpuOccRate * 100) + "%",
            left: '69%',
            top: '57%',
            textAlign: 'center',
            textStyle: {
                fontSize: '17',
                fontWeight: '600',
                color: 'rgba(58,182,224, 1)',
                textAlign: 'center',
            },
        }, {
            text: 'CPU占用率',
            left: '69%',
            top: '65%',
            textAlign: 'center',
            textStyle: {
                fontSize: '9.7',
                fontWeight: '250',
                color: 'rgba(255,255,255, .95)',
                textAlign: 'center',
            },
        },
        //3
        {
            text: parseInt(show_resOccRate * 100) + "%",
            left: '29%',
            top: '57%',
            textAlign: 'center',
            textStyle: {
                fontSize: '17',
                fontWeight: '600',
                color: 'rgba(58,182,224, 1)',
                textAlign: 'center',
            },
        }, {
            text: '资源占用率',
            left: '29%',
            top: '65%',
            textAlign: 'center',
            textStyle: {
                fontSize: '9.7',
                fontWeight: '250',
                color: 'rgba(255,255,255, .95)',
                textAlign: 'center',
            },
        },



        ],
        series: [
            {
                type: 'pie',
                radius: ['28%', '33%'],
                center: ['50%', '27%'],
                data: [{
                    hoverOffset: 1,
                    value: show_cpuOccRate * 100,
                    name: '虚拟主机',
                    itemStyle: {
                        color: 'rgba(58,182,224, 1)',
                    },
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    hoverAnimation: false,
                },
                {
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_cpuOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .4)',
                    },
                }
                ]
            },
            {
                type: 'pie',
                radius: ['33%', '38%'],
                center: ['50%', '27%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_cpuOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .2)',
                        width: 7
                    },
                }]
            },
            {
                type: 'pie',
                radius: ['26%', '23%'],
                center: ['50%', '27%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_cpuOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .1)',
                    },
                }]
            },

            //2
            {
                type: 'pie',
                radius: ['28%', '33%'],
                center: ['70%', '65%'],
                data: [{
                    hoverOffset: 1,
                    value: show_memoOccRate * 100,
                    name: '虚拟主机',
                    itemStyle: {
                        color: 'rgba(58,182,224, 1)',
                    },
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    hoverAnimation: false,
                },
                {
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_memoOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .4)',
                    },
                }
                ]
            },
            {
                type: 'pie',
                radius: ['33%', '38%'],
                center: ['70%', '65%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_memoOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .2)',
                        width: 7
                    },
                }]
            },
            {
                type: 'pie',
                radius: ['26%', '23%'],
                center: ['70%', '65%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_memoOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .1)',
                    },
                }]
            },

            //3
            {
                type: 'pie',
                radius: ['28%', '33%'],
                center: ['30%', '65%'],
                data: [{
                    hoverOffset: 1,
                    value: show_resOccRate * 100,
                    name: '虚拟主机',
                    itemStyle: {
                        color: 'rgba(58,182,224, 1)',
                    },
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    hoverAnimation: false,
                },
                {
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_resOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .4)',
                    },
                }
                ]
            },
            {
                type: 'pie',
                radius: ['33%', '38%'],
                center: ['30%', '65%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_resOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .2)',
                        width: 7
                    },
                }]
            },
            {
                type: 'pie',
                radius: ['26%', '23%'],
                center: ['30%', '65%'],
                data: [{
                    label: {
                        show: false
                    },
                    labelLine: {
                        normal: {
                            smooth: true,
                            lineStyle: {
                                width: 0
                            }
                        }
                    },
                    value: 100 - show_resOccRate * 100,
                    hoverAnimation: false,
                    itemStyle: {
                        color: 'rgba(58,182,224, .1)',
                    },
                }]
            },

        ]
    };

    myChart.setOption(option);
}

function cluster_graph3() {
    var myChart = echarts.init(document.getElementById('cluster_3'));

    var option = {
        // backgroundColor: '#23243a',
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                label: {
                    backgroundColor: '#6a7985'
                }
            },
            textStyle: {
                color: '#fff',
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 12,
            }
        },
        grid: {
            left: '1%',
            right: '5%',
            bottom: '0%',
            top: '7%',
            containLabel: true,
        },
        legend: {
            show: false,
            right: 10,
            top: 0,
            itemGap: 16,
            itemWidth: 18,
            itemHeight: 10,
            data: [
                {
                    name: '流出',
                }],
            textStyle: {
                color: '#a8aab0',
                fontStyle: 'normal',
                fontFamily: '微软雅黑',
                fontSize: 12,
            }
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: true,//坐标轴两边留白
                data: clusterGroupName,
                axisLabel: {
                    textStyle: {
                        color: '#a8aab0',
                        fontStyle: 'normal',
                        fontFamily: '微软雅黑',
                        fontSize: 12,
                    }
                },
                axisTick: {//坐标轴刻度相关设置。
                    show: false,
                },
                axisLine: {//坐标轴轴线相关设置
                    lineStyle: {
                        color: '#fff',
                        opacity: 0.2
                    }
                },
                splitLine: { //坐标轴在 grid 区域中的分隔线。
                    show: false,
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                splitNumber: 5,
                axisLabel: {
                    textStyle: {
                        color: '#a8aab0',
                        fontStyle: 'normal',
                        fontFamily: '微软雅黑',
                        fontSize: 12,
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#fff'],
                        opacity: 0.06
                    }
                }

            }
        ],
        series: [
            {
                name: '任务数量',
                type: 'bar',
                data: mask_Whole,
                barWidth: 10,
                barGap: 0.2,//柱间距离
                label: {//图形上的文本标签
                    normal: {
                        show: true,
                        position: 'top',
                        textStyle: {
                            color: '#a8aab0',
                            fontStyle: 'normal',
                            fontFamily: '微软雅黑',
                            fontSize: 12,
                        },
                    },
                },
                itemStyle: {//图形样式
                    normal: {
                        // barBorderRadius: [5, 5, 0, 0],
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: 'rgba(58,182,224, 0.3)'
                        }, {
                            offset: 0.85, color: 'rgba(98,113,228,0.8)'
                        }], false),
                    },
                },
            }
        ]
    };

    myChart.setOption(option);
}

function cluster_graph4() {
    var myChart = echarts.init(document.getElementById('cluster_4'));

    option = {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "cross",
                animation: false
            }
        },
        grid: {
            left: '1%',
            right: '5%',
            bottom: '0%',
            top: '7%',
            containLabel: true,
        },
        xAxis: {
            // 横轴数据
            data: shadowGraphData.map(function (item) {
                return item.date;
            }),
            // 坐标起点不从零开始
            axisLine: {
                onZero: false
            },
            axisLabel: {
                textStyle: {
                    color: '#a8aab0',
                    fontStyle: 'normal',
                    fontFamily: '微软雅黑',
                    fontSize: 12,
                }
            },
            nameLocation: "center",
            nameTextStyle: {
                fontWeight: "bold",
                fontSize: "15"
            },
            boundaryGap: false
        },
        yAxis: [
            {
                type: 'value',
                splitNumber: 5,
                axisLabel: {
                    textStyle: {
                        color: '#a8aab0',
                        fontStyle: 'normal',
                        fontFamily: '微软雅黑',
                        fontSize: 12,
                    }
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#fff'],
                        opacity: 0.06
                    }
                }

            }
        ],
        series: [
            {
                name: "上边界",
                type: "line",
                data: shadowGraphData.map(function (item) {
                    // console.log('item', item)
                    return [item.date, item.u];
                }),
                areaStyle: {
                    //区域填充样式
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0,
                            0,
                            1,
                            0,
                            [{
                                offset: 0,
                                color: "rgba(58,182,224, 0.6)"
                            }, {
                                offset: 0.6,
                                color: "rgba(58,182,224, 0.2)"
                            },
                            {
                                offset: 0.8,
                                color: "rgba(58,182,224, 0.01)"
                            }
                            ],
                            false
                        ),
                        shadowColor: "rgba(58,182,224, 0.1)",
                        shadowBlur: 6
                    }
                },
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                symbol: "none"
            },
            {
                name: "拟合曲线",
                type: "line",
                data: shadowGraphData.map(function (item) {
                    return [item.date, item.value];
                }),
                hoverAnimation: false,
                symbolSize: 6,
                itemStyle: {
                    color: '#3eb5dd',
                    borderColor: '#f1f1f1',
                    borderWidth: 1
                },
                lineStyle: {
                    normal: {
                        width: 1.5,
                        color: {
                            type: 'linear',
                            colorStops: [{
                                offset: 0,
                                color: '#57b3e5' // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: '#31a9ea' // 100% 处的颜色
                            }
                            ],
                            globalCoord: false // 缺省为 false
                        },
                        shadowColor: 'rgba(249,165,137, 0.5)',
                        shadowBlur: 30,
                        shadowOffsetY: 5
                    }
                },
                showSymbol: false
            },
            {
                name: "下边界",
                type: "line",
                data: shadowGraphData.map(function (item) {
                    return [item.date, item.l];
                }),
                areaStyle: {
                    //区域填充样式
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0,
                            0,
                            1,
                            0,
                            [{
                                offset: 0,
                                color: "rgba(58,182,224, 0.6)"
                            }, {
                                offset: 0.6,
                                color: "rgba(58,182,224, 0.2)"
                            },
                            {
                                offset: 0.8,
                                color: "rgba(58,182,224, 0.01)"
                            }
                            ],
                            false
                        ),
                        shadowColor: "rgba(58,182,224, 0.1)",
                        shadowBlur: 6
                    }
                },
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                symbol: "none"
            }
        ]

    };
    myChart.setOption(option);
}

/*
* 监听集群占用情况中的选择列表
* 根据当前选项更新对应显示的数据
* 再重新刷新该栏画布
*/
var clusterName = clusterGroup_MASK[0].name;
$("#cluster_option").change(function () {
    var opt = $("#cluster_option option:selected");
    clusterName = opt.text();

    for (var i = 0; i < clusterGroup_RES.length; i++) {
        if (clusterGroup_RES[i].name === clusterName) {
            show_cpuOccRate = clusterGroup_RES[i].cpuOccRate;
            show_memoOccRate = clusterGroup_RES[i].memoOccRate;
            show_resOccRate = clusterGroup_RES[i].resOccRate;
            break;
        }
    }
    cluster_graph2();
});

/*
* 监听算法面板中的确认按钮
* 分别遍历上下两个算法对应的选择
* 结果存入checkvalue数组中
*/
$("#yes").click(function () {
    var radio_tag = document.getElementsByName("radio");
    var radio_tag2 = document.getElementsByName("radio2");
    var checkvalue = [];

    for (var i = 0; i < radio_tag.length; i++) {
        if (radio_tag[i].checked) {
            checkvalue.push(radio_tag[i].value);
            break;
        }
    }

    for (var i = 0; i < radio_tag2.length; i++) {
        if (radio_tag2[i].checked) {
            checkvalue.push(radio_tag2[i].value);
            break;
        }
    }
    console.log(checkvalue);

    $.post("/algorithmChosen",{checkvalue},function(data,status){
        console.log("/algorithmChosen start");
        console.log(data);
    });
});


//动态刷新拓扑网络数据，达到指定线条的动画效果（新修正了Node、线条的动画大小）
function getSeries(seArr) {
    se = [];
    se.push(
        {
            // name: '设备信息',
            zlevel: 1,
            type: 'scatter',
            coordinateSystem: 'geo',
            data: allArr,
            symbolSize: nodeSymbolSize,
            label: {
                normal: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                emphasis: {
                    show: true,
                }
            },
        },
        {
            // name: '连接路线',
            type: "lines",
            coordinateSystem: 'geo',
            polyline: false,
            z: 1,
            zlevel: 1,
            animation: false,
            effect: {
                show: false,
            },
            lineStyle: {
                normal: {
                    color: "rgba(55,155,255,0.7)",
                    width: 0.95,
                    curveness: 0.2,
                    opacity: 0.7,
                }
            },
            data: DataArr,
        },
        {
            name: '连接路线2',
            type: "lines",
            coordinateSystem: 'geo',
            polyline: false,
            z: 1,
            zlevel: 1,
            animation: false,
            effect: {
                show: false,
            },
            lineStyle: {
                normal: {
                    color: "rgba(55,155,255,1)",
                    width: 2,
                    curveness: 0.4,
                    opacity: 0.7,
                }
            },
            data: CloudLineArr,
        },
        //边缘端Master类动画
        {
            name: 'MASTER',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: erArr,
            symbolSize: 15,
            showEffectOn: 'emphasi',
            rippleEffect: {
                scale: 2,
                // period:5,
                brushType: 'stroke'
            },
            hoverAnimation: true,
            itemStyle: {
                normal: {
                    color: '#f4e925',
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            zlevel: 1
        },
        //边缘端Node动画
        {
            name: 'MASTER2',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: sanArr,
            symbolSize: 5,
            showEffectOn: 'emphasi',
            rippleEffect: {
                brushType: 'stroke',
                scale: 10
            },
            hoverAnimation: true,
            itemStyle: {
                normal: {
                    // color: '#f4e925',
                    shadowBlur: 10,
                    shadowColor: '#333'
                }
            },
            zlevel: 1
        },
        //云端Node动画
        {
            name: 'MASTER3',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: CloudNodeArr,
            symbolSize: 1.9,
            showEffectOn: 'emphasi',
            rippleEffect: {
                brushType: 'stroke',
                scale: 2
            },
            hoverAnimation: true,
            itemStyle: {
                normal: {
                    color: '#f4e925',
                    shadowBlur: 5,
                    shadowColor: '#333'
                }
            },
            zlevel: 1
        },
    )

    seArr.forEach(function (item, i) {
        // console.log("遍历seArr数组");
        // console.log(item);
        se.push(
            {
                name: '线路',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 2,
                large: true,
                effect: {
                    show: true,
                    constantSpeed: 15,
                    symbol: 'pin',//ECharts 提供的标记类型包括 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'
                    symbolSize: 9,
                    trailLength: 0,
                    loop: false
                },
                lineStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0, color: '#58B3CC'
                        }, {
                            offset: 1, color: "rgba(55,155,255,0.5)"
                        }], false),
                        width: 1.2,
                        opacity: 0.65,
                        curveness: 0.2
                    }
                },
                data: [item]
            })
    })
    return se;
}

var k = 0;
//模拟动态中心处拓扑
setInterval(function () {
    var myChart = echarts.init(document.getElementById('map'));
    if (k % 15 == 0) {
        tempData = [];
    }
    var randomNum = Math.round(Math.random() * 800);

    var tmpItem = DataArr[randomNum];
    tmpItem["dif"] = (Math.random(0, 5)).toFixed(4);
    // console.log(tmpItem);
    tempData.push(tmpItem);
    myChart.setOption({ series: getSeries(tempData) });
    //map();
    k++;
}, 400);

//通过name寻找对应线条，激活动画，传入格式为{from:"Master1",to:"Node1"}的字典
//如果是Mater调度云端集群的情况，只需要让to的key值为"cloudEnter"即可，会通过距离计算相对较近的云集群入口
function AnimationActive(dic) {
    var myChart = echarts.init(document.getElementById('map'));
    if (!k % 15) {
        tempData = [];
    }

    //Master -> cloud集群入口
    if (dic["to"] === "cloudEnter") {
        //因为Master->cloud线条是新增的，所以只能寻找对应的Master和cloude的坐标，把线条新添加到画布中
        var corMas = [0, 0];

        for (var i = 0; i < erArr.length; i++) {
            if (erArr[i].name === dic["from"]) {
                corMas = erArr[i].value;
                break;
            }
        }
        const dis1 = (corMas[0] - cloudEnterPos1[0]) * (corMas[0] - cloudEnterPos1[0]) + (corMas[1] - cloudEnterPos1[1]) * (corMas[1] - cloudEnterPos1[1]);
        const dis2 = (corMas[0] - cloudEnterPos2[0]) * (corMas[0] - cloudEnterPos2[0]) + (corMas[1] - cloudEnterPos2[1]) * (corMas[1] - cloudEnterPos2[1]);
        var targerPos = [0, 0];

        if (dis1 > dis2) {
            targerPos = cloudEnterPos2;
        }
        else {
            targerPos = cloudEnterPos1;
        }
        var tmpItem = [
            { coord: corMas },
            { coord: targerPos },
            { name: dic["from"] + dic["to"] },
        ];
        tmpItem["dif"] = (Math.random(0, 5)).toFixed(4);
        tempData.push(tmpItem);
        myChart.setOption({ series: getSeries(tempData) });
        k++;
    }
    //非Master -> cloud集群入口的情况
    else {
        var targetName = dic["from"] + dic["to"];

        //根据Name寻找对应线条
        for (var i = 0; i < DataArr.length; i++) {
            if (DataArr[i][2].name === targetName) {
                var tmpItem = DataArr[i];
                tmpItem["dif"] = (Math.random(0, 5)).toFixed(4);
                tempData.push(tmpItem);
                myChart.setOption({ series: getSeries(tempData) });
                k++;
                break;
            }
        }
    }
}

setInterval(function () {
    var dic = { from: "Master_0", to: "cloudEnter" }
    AnimationActive(dic);

}, 1000);

//格式对齐，0填充
function fillZero(str) {
    var realNum;
    if (str < 10) {
        realNum = '0' + str;
    } else {
        realNum = str;
    }
    return realNum;
}

//模拟动态折线图表与阴影折线图（需要被替换）
var record = Math.round(Math.random() * 100 - 10);
setInterval(function () {
    /*
    模拟动态折线图表
     */
    var myDate = new Date();
    var myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    var myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    var myToday = myDate.getDate(); //获取当前日(1-31)
    var myDay = myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
    var myHour = myDate.getHours(); //获取当前小时数(0-23)
    var myMinute = myDate.getMinutes(); //获取当前分钟数(0-59)
    var mySecond = myDate.getSeconds(); //获取当前秒数(0-59)

    var value = record + Math.round(Math.random() * 21 + 2);

    record = value;
    var now = myYear + '-' + fillZero(myMonth) + '-' + fillZero(myToday) + ' ' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);
    // // console.log(now);
    // // console.log(record);
    // //console.log(now);
    // data['fir'].push([now, value]);
    // data['sec'].push([now, value]);
    // data['thi'].push([now, value]);
    // task();//刷新对应图表的画布

    /*
    模拟阴影折线图
     */
    var shadow_value = Math.random();
    var shadow_date = "" + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);
    var shadow_l = shadow_value - Math.random() * 1.3;
    var shadow_u = shadow_value + Math.random() * 0.5;

    shadowGraphData.push({
        value: shadow_value,
        date: shadow_date,
        l: shadow_l,
        u: shadow_u
    });
    cluster_graph4();//刷新对应图表的画布

}, 800);

//平台资源占用情况（要被下面的替换）
// setInterval(function() {
// 	dataArr[0].value = Math.round(Math.random() * 21+10);
// 	dataArr[1].value = Math.round(Math.random() * 21+3);
// 	dataArr[2].value = Math.round(Math.random() * 21+1);
// 	resource();
// }, 800);

//最下方图表-更新数据的任务情况（被替换）
// setInterval(function () {
//     /*
//     * 接收后端数据部分，更新clusterGroup中每个culster的task情况
//     *
//     */
//     var current_clusterGroupLength = 7;//最新集群的数量
//     var culsterChange = false;//集群是否改变
//     if (clusterGroupName.length == current_clusterGroupLength)//如果集群数量没有改变
//         culsterChange = false;
//     else {
//         culsterChange = true;
//     }
//     //清空原数据
//     clusterGroupName.length = 0;
//     mask_Overstock.length = 0;
//     mask_Success.length = 0;
//     mask_Default.length = 0;
//     mask_Whole.length = 0;
//     clusterData(culsterChange);//需要同时更新用于绘图的各项数据数组

//     cluster_graph1();//刷新画布
//     cluster_graph3();//刷新画布
// }, 800);

//判定clusterGroup_RES集群设备ID是否出现改变（包括在数组中的顺序）
function ClustersIDCheck(lastNameGroup) {
    var checkNameGroup = [];
    for (var i = 0; i < clusterGroup_RES.length; i++) {
        checkNameGroup.push(clusterGroup_RES[i].name);
    }

    if (lastNameGroup.toString() == checkNameGroup.toString()) {
        return false;//未改变
    }
    else {
        return true;//发生改变
    }
}


setInterval(function () {
    /*
    * 接收后端数据部分，更新clusterGroup中每个culster的task情况
    *{tasksAll:{success:,failure:,stuck:},master2:{memory:,cpu:,pods:}},tasksAll:{master1:{success:,failure:,stuck:,},master2:{success:,failure:,stuck:,}}}
    */
    $.ajax({
        //修改
        url: '/ExecuteAll',
        headers: {
            'Accept': 'application/json'
        },
        success: function (resp) {
            console.log(resp);

            //记录上组数据中的设备名称
            var lastClustersID = [].concat(clusterGroupName);

            //清空上组数据,下面2行注掉可以看到模拟效果（即还是用原数据）
            clusterGroup_MASK.length = 0;
            clusterGroupName.length = 0;
            mask_Overstock.length = 0;
            mask_Success.length = 0;
            mask_Default.length = 0;
            mask_Whole.length = 0;

            let count = resp['count']
            let tasks_all = resp['tasks_all']

            if (JSON.stringify(tasks_all) != "{}") {
                for (let key1 in tasks_all) {
                    let value1 = tasks_all[key1];
                    let item = {};
                    item.name = key1;
                    item.mask_Overstock = value1['stuck'];
                    item.mask_Success = value1['success'];
                    item.mask_Default = value1['failure'];
                    clusterGroup_MASK.push(item);
                }
            }

            var clusterChange = ClustersIDCheck(lastClustersID);//集群ID是否改变

            clusterData(clusterChange);//需要同时更新用于绘图的各项数据数组

            cluster_graph1();//刷新画布
            cluster_graph3();//刷新画布

            var myDate = new Date();
            var myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
            var myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
            var myToday = myDate.getDate(); //获取当前日(1-31)
            var myDay = myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
            var myHour = myDate.getHours(); //获取当前小时数(0-23)
            var myMinute = myDate.getMinutes(); //获取当前分钟数(0-59)
            var mySecond = myDate.getSeconds(); //获取当前秒数(0-59)

            var now = myYear + '-' + fillZero(myMonth) + '-' + fillZero(myToday) + ' ' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);

            data['fir'].push([now, count['failure']]);
            data['sec'].push([now, count['success']]);
            data['thi'].push([now, count['stuck']]);
            task();//刷新对应图表的画布

        },
        error: function (message) {
            console.log("提交数据失败！888" + message);
        }
    })

}, 2000);

/*
* 接收后端数据部分
* 更新整体资源
* 更新clusterGroup中每个culster的cpuOccRate, memoOccRate, resOccRate。
*
*/
setInterval(function () {

    $.ajax({
        //修改
        url: '/v3/clusters',
        headers: {
            'Accept': 'application/json'
        },
        success: function (resp) {
            
            clusterGroup_RES.length = 0;

            let cpuAllocatableSum = 0;
            let memoryAllocatableSum = 0;
            let podAllocatableSum = 0;

            let cpuRequestedSum = 0;
            let memoryRequestedSum = 0;
            let podRequestedSum = 0;

            let data = resp['data'];
            data.forEach((element, index) => {
                // console.log(element, index);
                let reg = /(\d+)(.*)/
                //allocatable
                let allocatable = element.allocatable;
                //转换单位是什么
                let allocatableCpu = parseInt(allocatable.cpu);
                cpuAllocatableSum += allocatableCpu;
                //以后可能要转换
                let allocatableMemoryNumber = parseInt(allocatable.memory.match(reg)[1]);
                let allocatableMemoryUnit = allocatable.memory.match(reg)[2];
                memoryAllocatableSum += allocatableMemoryNumber;

                let allocatablePods = parseInt(allocatable.pods);
                podAllocatableSum += allocatablePods

                //requested
                let requested = element.requested;

                let requestedCpuNumber = parseInt(requested.cpu.match(reg)[1]);
                let requestedCpuUnit = requested.cpu.match(reg)[2];
                cpuRequestedSum += requestedCpuNumber;
                let requestedMemoryNumber = parseInt(requested.memory.match(reg)[1]);
                let requestedMemoryUnit = requested.memory.match(reg)[2];
                memoryRequestedSum += requestedMemoryNumber;
                let requestedPods = parseInt(requested.pods);
                podRequestedSum += requestedPods;

                                //单个存入
                let thisName = element.name;
                let thisCPU=(requestedCpuNumber / (allocatableCpu * 1000)).toFixed(2);
                let thisMemo=(requestedMemoryNumber * 1024 / allocatableMemoryNumber).toFixed(2);
                let thisRes=(requestedPods / allocatablePods).toFixed(2);
                
                clusterGroup_RES.push({ name: thisName, cpuOccRate: thisCPU, memoOccRate: thisMemo, resOccRate: thisRes })

            });

            let clusterName = $("#cluster_option option:selected").text();

            //将更新的数据赋给show变量
            for (var i = 0; i < clusterGroup_RES.length; i++) {
                if (clusterGroup_RES[i].name === clusterName) {
                    show_cpuOccRate = clusterGroup_RES[i].cpuOccRate;
                    show_memoOccRate = clusterGroup_RES[i].memoOccRate;
                    show_resOccRate = clusterGroup_RES[i].resOccRate;
                    break;
                }
            }

            cluster_graph2();//刷新画布

            let cpuPercent = Math.round(cpuRequestedSum / (cpuAllocatableSum * 1000) * 100);
            let memoryPercent = Math.round(memoryRequestedSum * 1024 / memoryAllocatableSum * 100);
            let podsPercent = Math.round(podRequestedSum / podAllocatableSum * 100);

            // console.log(cpuPercent);
            // console.log(memoryPercent);
            // console.log(podsPercent);

            currentResource = new Array(3)
            dataArr[0].value = memoryPercent
            dataArr[1].value = cpuPercent
            dataArr[2].value = podsPercent
            resource();

        },
        error: function (message) {
            console.log(message);
            alert("提交数据失败！888" + message);
        }
    })
}, 3000);


//模拟结点数据传输更新
setInterval(function () {
    allArr.forEach((el) => {
        el["cpuOccRate"] = Math.round(Math.random() * 21 + 10) + "%";
        el["memoOccRate"] = Math.round(Math.random() * 11 + 10) + "%";
        el["resOccRate"] = Math.round(Math.random() * 8 + 10) + "%";
    });
}, 1000);

//模拟结点请求、镜像队列的更新
setInterval(function () {
    //边缘侧Master
    erArr.forEach((el) => {
        el["requestList"] = ["app3", "app2", "app1", "app4", "app2", "app3", "app1"];
    });
    //边缘侧Node
    sanArr.forEach((el) => {
        el["requestList"] = ["app1", "app2", "app3", "app4", "app2", "app3", "app1"];
        el["mirrorList"] = ["app3", "app4", "app1"];
    });
}, 8000);

//（新任务出现）根据设备名称、请求/请求，进行具体设备请求、镜像数据添加;传入格式为{from:"Master1",req:"app1"}或{from:"Master1",mir:"app1"}
/*var di = {from:"Node_752",req:"app1"};
MirReqDataAdd(di,true)*/
function MirReqDataAdd(dic, isReq) {
    var name = dic["from"];
    var newTask = "";
    if (isReq) {
        newTask = dic["req"];
        //根据name定位对应设备，添加到对应的数组中
        for (var i = 0; i < allArr.length; i++) {
            if (allArr[i]["name"] === name) {
                // console.log(allArr[i]["name"]);
                allArr[i]["requestList"].push(newTask);
                break;
            }
        }
    }
    else {
        newTask = dic["mir"];
        //根据name定位对应设备，添加到对应的数组中
        for (var i = 0; i < allArr.length; i++) {
            if (allArr[i]["name"] === name) {
                // console.log(allArr[i]["name"]);
                allArr[i]["mirrorList"].push(newTask);
                break;
            }
        }
    }
}

//（任务已完成）根据设备名称、请求/请求，进行具体设备请求、镜像数据弹出;传入格式为{from:"Master1",req:"app1"}或{from:"Master1",mir:"app1"}
/*var di = {from:"Node_752",req:"app1"};
MirReqDataPop(di,true)*/
function MirReqDataPop(dic, isReq) {
    var name = dic["from"];
    if (isReq) {
        //根据name定位对应设备
        for (var i = 0; i < allArr.length; i++) {
            if (allArr[i]["name"] === name) {
                // console.log(allArr[i]["name"]);
                allArr[i]["requestList"].pop();//弹出首项，默认为队列排序
                break;
            }
        }
    }
    else {
        //根据name定位对应设备
        for (var i = 0; i < allArr.length; i++) {
            if (allArr[i]["name"] === name) {
                // console.log(allArr[i]["name"]);
                allArr[i]["mirrorList"].pop();
                break;
            }
        }
    }
}



setInterval(function () {
    var myDate = new Date();
    var myYear = myDate.getFullYear(); //获取完整的年份(4位,1970-????)
    var myMonth = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    var myToday = myDate.getDate(); //获取当前日(1-31)
    var myDay = myDate.getDay(); //获取当前星期X(0-6,0代表星期天)
    var myHour = myDate.getHours(); //获取当前小时数(0-23)
    var myMinute = myDate.getMinutes(); //获取当前分钟数(0-59)
    var mySecond = myDate.getSeconds(); //获取当前秒数(0-59)
    var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    var nowTime;

    nowTime = myYear + '年' + fillZero(myMonth) + '月' + fillZero(myToday) + '日' + '&nbsp;&nbsp;' + fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond) + '&nbsp;&nbsp;' + week[myDay] + '&nbsp;&nbsp;';
    tmpsysTime = fillZero(myHour) + ':' + fillZero(myMinute) + ':' + fillZero(mySecond);

    $('#time').html(nowTime);
    $('#systime').html(tmpsysTime);
}, 1000);
