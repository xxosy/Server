process.binding('http_parser').HTTPParser = require('http-parser-js').HTTPParser;

var http = require('http');
var express = require('express');
var moment = require('moment');
var request = require('request');
var mkdir = require('mkdirp');
var scheduler = require('node-schedule');
//var hashmap = require('hashmap');

function consoleLog(log) {
    console.log('[' + moment().format('YYYY-MM-DD hh:mm:ss') + '] ' + log);
}

//�̹��� ���� �Լ�
//fs.createWriteStream �κп� �Ű����� ���� Ȯ��
var download = function(userName, password, uri, fileDir, fileName, callback) {

    mkdir(fileDir, function(err) {
        if (err) consoleLog("mkdir error : " + err);
    });

    request.head(uri, function(err, res, body) {
        request.get(uri).auth(userName, password, false).pipe(fs.createWriteStream(fileDir + "/" + fileName)).on('close', callback);
    });
};


var app = express();
app.set('port', process.env.PORT || 8084);
app.set('jsonp allback', true);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Camera server listening on port ' + app.get('port'));
});

app.get('/check', function(req, res) {
    res.jsonp({
        "status": "ok"
    });
});

var imgRootPath = "C:/SSL/Server/PAIS WEB/WebPage/public/img/camera";

app.get('/saveTest', function(req, res) {
    consoleLog("all cams image save start");

    for (i = 0; i < camInfo_list.length; i++) {
        var camInfo = camInfo_list[i];

        if (camInfo.isConnect) {
            var cam = camInfo.cam;
            cam.getSnapshotUri(function(err, img) {
                if (!err) {
                    if (img !== undefined && img != null) {
                        var uri = img.uri;
                        var tmp = uri.split("/");
                        var port = tmp[2].split(":")[1];
                        tmp[2] = this.hostname + ":" + port;

                        var date = new Date(),
                            folderName = imgRootPath + "/" + moment().format('YYYY-MM-DD') + "/" + this.hostname + "_" + port,
                            fileName = moment().format('HH') + ".png";

                        var imgUri = "";
                        for (var j = 0; j < tmp.length; j++) {
                            imgUri = imgUri + tmp[j] + "/";
                        }
                        consoleLog(imgUri);

                        consoleLog(this.hostname + " download start====");
                        download(this.username, this.password, imgUri, folderName, fileName, function() {
                            completeCamCount++;
                            consoleLog(folderName + fileName + " saved " + completeCamCount);
                            if (completeCamCount == camInfo_list.length) {
                                completeCamCount = 0;
                                downReqeustCount = 0;
                                consoleLog("all cams image save end");
                                res.jsonp({
                                    "status": "ok"
                                });
                            }
                        });

                        downReqeustCount++;
                    } else {
                        consoleLog("ERROR : img is null _ " + this.hostname + ":" + this.port);
                        res.jsonp({
                            "status": "err"
                        });
                    }
                } else {
                    consoleLog("ERROR scheduler getSnapshotUri" + err);
                    res.jsonp({
                        "status": "err"
                    });
                }
            });
        }
    }
});

app.get('/imgSave/:ip/:port', function(req, res) {
    var ip = req.params.ip;
    var port = req.params.port;

    consoleLog(ip + ":" + port + "]  image save : start");

    // consoleLog(ip + ":" + port + "]  images save : camInfo_list.length = " + camInfo_list.length);
    for (i = 0; i < camInfo_list.length; i++) {
        // consoleLog(ip + ":" + port + "]  images save : i = " + i);
        if (camInfo_list[i].ip == ip && camInfo_list[i].port == port) {
            var camIndex = i;

            // consoleLog(ip + ":" + port + "]  images save : in if, ip =" + camInfo_list[i].ip);
            camInfo_list[i].cam.getSnapshotUri(function(err, img) {
                // consoleLog("in getSnapshotUri");
                if (!err) {
                    if (img !== undefined && img != null) {
                        var date = new Date(),
                            fileName = this.hostname + "." + port + ".png";

                        var uri = img.uri;
                        console.log(uri);
                        var tmp = uri.split("/");
                        tmp[2] = ip + ":" + port;

                        var imgUri = "";
                        for (var j = 0; j < tmp.length; j++) imgUri = imgUri + tmp[j] + "/";

                        var fileDir = imgRootPath;

                        download(this.username, this.password, imgUri, fileDir, fileName, function() {
                            consoleLog(ip + ":" + port + "  image save : end");
                            res.jsonp({
                                "status": "ok"
                            });
                        });
                    } else {
                        consoleLog("ERROR : img is null _ " + img);
                        res.jsonp({
                            "status": "err"
                        });
                    }
                } else {
                    res.jsonp({
                        "status": "err"
                    });
                }
            });
        }
    }
});

//�����췯�� �̿��� �ð����� �������� �� ����
//2�ð����� ���� ī�޶� ���� ����
//1�ð����� ���� ���� ����
var completeCamCount = 0;
var downReqeustCount = 0;
var j = scheduler.scheduleJob('0 * * * *', function() {
    downReqeustCount = 0;
    if (moment().hour() % 2 == 0) { //2�ð����� �ѹ���, ¦�� �� �϶�����

        //ī�޶� ��������

        consoleLog("all cams image save start");

        for (i = 0; i < camInfo_list.length; i++) {
            var camInfo = camInfo_list[i];

            if (camInfo.isConnect) {
                var cam = camInfo.cam;
                cam.getSnapshotUri(function(err, img) {
                    if (!err) {
                        if (img !== undefined && img != null) {
                            var uri = img.uri;
                            var tmp = uri.split("/");
                            var port = tmp[2].split(":")[1]
                            tmp[2] = this.hostname + ":" + port;

                            var date = new Date(),
                                folderName = imgRootPath + "/" + moment().format('YYYY-MM-DD') + "/" + this.hostname + "_" + port,
                                fileName = moment().format('HH') + ".png";

                            var imgUri = "";
                            for (var j = 0; j < tmp.length; j++) {
                                imgUri = imgUri + tmp[j] + "/";
                            }
                            consoleLog(this.hostname + " download start====");
                            download(this.username, this.password, imgUri, folderName, fileName, function() {
                                completeCamCount++;
                                consoleLog(folderName + fileName + " saved " + completeCamCount);
                                if (completeCamCount == camInfo_list.length) {
                                    completeCamCount = 0;
                                    downReqeustCount = 0;
                                    consoleLog("all cams image save end");
                                }
                            });

                            downReqeustCount++;
                        } else {
                            consoleLog("ERROR : img is null _ " + this.hostname + ":" + this.port);
                        }
                    } else {
                        consoleLog("ERROR scheduler getSnapshotUri" + err);
                    }
                });
            }
        }

        //���� ���� ����

    }
});

//ī�޶� ���� ��ü
function CamInfo(ip, port, onvifPort, userName, password) {
    this.ip = ip;
    this.port = port;
    this.onvifPort = onvifPort;
    this.userName = userName;
    this.password = password;
    this.isConnect = false;
    this.cam = null;
}

//ī�޶� ���� ���� ���� (��ġ�ϴ� ī�޶� ���� �Է�) [������]
var userName = 'admin';
var password = '0632551113';
var camInfo_list = new Array();

//TBD 카메라 리스트 가지고 와야함
// camInfo_list[0] = new CamInfo('210.117.128.253', 3333, 3335, userName, password);
// camInfo_list[1] = new CamInfo('210.117.128.253', 3334, 3336, userName, password);
//camInfo_list[0] = new CamInfo('59.2.231.81', 80, userName, password);
//camInfo_list[1] = new CamInfo('59.2.231.81', 8001, userName, password);
//camInfo_list[2] = new CamInfo('210.111.218.44', 8000, 'admin1', password);
//camInfo_list[1] = new CamInfo('210.117.128.201', 80, userName, password);

request('http://www.ezsmartfarm.com:3000/sensor/camera/list/all', function(error, response, body) {
    if(body!=undefined){
        var camInfo_all = JSON.parse(body).data;
        if (camInfo_all.length != 0) {
            var userName = 'admin';
            var password = '0632551113';

            var index = 0;
            for (i = 0; i < camInfo_all.length; i++) {
                var camInfo = camInfo_all[i];
                if(camInfo.url != '-' &&camInfo.url != undefined &&camInfo.url != null) {
                    var ip = camInfo.url.split(":")[1].split("//")[1];
                    camInfo_list[index++] = new CamInfo(ip, 3333, 3335, userName, password);
                    camInfo_list[index++] = new CamInfo(ip, 3334, 3336, userName, password);
                }
            }
            onvifConnect();
        } else {
            return;
        }
    }
});

//var cam_hashMap = new HashMap();  //키 : URL, 값 : 위에 만든 클래스


var Cam = require('./lib/onvif').Cam,
    fs = require('fs');

//onvif ī�޶� ���� �κ�(������ ������ ī�޶� ���� ���Ͽ� �ش��ϴ� ī�޶� ��ü ����)
function onvifConnect() {
    for (i = 0; i < camInfo_list.length; i++) {
        var cam = new Cam({
            hostname: camInfo_list[i].ip,
            username: camInfo_list[i].userName,
            password: camInfo_list[i].password,
            port: camInfo_list[i].onvifPort
        }, function(err) { //ī�޶� ��ü ���� �Ϸ� �ݹ��Լ� (���� �߻� ���� Ȯ�� ����)
            if (err) {
                consoleLog(err);
                return;
            }
            for (j = 0; j < camInfo_list.length; j++) {
                if (camInfo_list[j].ip == this.hostname && camInfo_list[j].onvifPort == this.port) {
                    camInfo_list[j].cam = this;
                    camInfo_list[j].isConnect = true;
                    break;
                }
            }
            consoleLog('connected, ' + this.hostname + ':' + this.port);

            
        });

        //var key =
        //cam_hashMap.set();
    }
}

function reConnect(camInfo) {
    //파라미터에 해당하는 애 재연결
}
