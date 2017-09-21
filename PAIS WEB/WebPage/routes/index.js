var express = require('express');
var router = express.Router();
var request = require('request');
var crypto = require('crypto');
var moment = require('moment');
var scheduler = require('node-schedule');
var mkdir = require('mkdirp');

var myServerIP = "http://localhost";
var myServerPort = "80";
var myServerCamPort = "8084";
var sensorServerPort = "3000";
var sensorServerWeightPort = "3232";

/*영어 페이지 연결*/
router.get('/en', function(req, res, next) {
    res.render('index_en', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

router.get('/en/journal', function(req, res, next) {
    res.render('journal_en', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

router.get('/en/weight', function(req, res, next) {
    res.render('weight_en', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

router.get('/journal', function(req, res, next) {
    res.render('journal', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

router.get('/weight', function(req, res, next) {
    res.render('weight', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});
router.get('/actuator', function(req, res, next) {
    res.render('actuator', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});
router.get('/test', function(req, res, next) {
    res.render('test', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

router.get('/kakaoLogin', function(req, res, next) {
    var kakaoRestKey = "d405df36708ace0f0609039df30e8e80";
    var redirect_uri = "http://www.ezsmartfarm.com/kakaoOauth";
    var request_url = "https://kauth.kakao.com/oauth/authorize?client_id=" + kakaoRestKey + "&redirect_uri=" + redirect_uri + "&response_type=code";

    res.redirect(request_url);
});

router.get('/kakaoLogout/:access_token', function(req, res, next) {
    var access_token = req.params.access_token;
    consoleLog(access_token);
    var options = {
        method: 'GET',
        url: 'https://kapi.kakao.com/v1/user/logout',
        headers: {
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/x-www-form-urlencoded'
        }
    };

    request(options, function(error, response, body) {
        if (response.statusCode == 200) {
            var jsonObj = JSON.parse(body);

            var id = jsonObj.id;

            consoleLog("{" + id + "} Log OUT");

            res.jsonp({
                "status": "ok"
            });
        } else {
            consoleLog("response.statusCode : " + response.statusCode);

            res.jsonp({
                "status": response.statusCode
            });
        }
    });
});

router.get('/kakaoTokenCheck/:access_token/:refresh_token', function(req, res, next) {
    var access_token = req.params.access_token;
    var refresh_token = req.params.refresh_token;
    var kakaoRestKey = "d405df36708ace0f0609039df30e8e80";

    var options = {
        method: 'GET',
        url: 'https://kapi.kakao.com/v1/user/access_token_info',
        headers: {
            authorization: 'Bearer ' + access_token,
            'content-type': 'application/x-www-form-urlencoded'
        }
    };

    request(options, function(error, response, body) {
        consoleLog(body);
        if (response.statusCode == 401) { //토큰 만료시 갱신처리

            options = {
                method: 'POST',
                url: 'https://kauth.kakao.com/oauth/token',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                postData: {
                    'grant_type': 'refresh_token',
                    'client_id': kakaoRestKey,
                    'refresh_token': refresh_token
                }
            };

            request(options, function(error2, response2, error2) {
                if (error2 === null && error2 !== null && error2 !== undefined && error2 !=="") {
                    var jsonObj = JSON.parse(body2);
                    //refresh_token이 갱신되었을 경우 언디파인이 아니고 유저한테 넘겨줘야함
                    if (jsonObj.refresh_token !== undefined) refresh_token = jsonObj.refresh_token;
                    if (jsonObj.id !== undefined) {
                        res.jsonp({
                            "status": "refresh",
                            "id": jsonObj.id,
                            "expires_in": jsonObj.expiresInMillis,
                            "access_token": jsonObj.access_token,
                            "refresh_token": refresh_token
                        });
                    } else res.jsonp({
                        "status": "undefined"
                    });
                }
            });

        } else { //만료 아닐때 (정상일때)
            var jsonObj = JSON.parse(body);
            if (jsonObj.id !== undefined) {
                res.jsonp({
                    "status": "ok",
                    "id": jsonObj.id,
                    "expires_in": jsonObj.expiresInMillis
                });
            } else res.jsonp({
                "status": "undefined"
            });
        }
    });

});

router.get('/kakaoOauth', function(req, res, next) {
    var code = req.query.code;
    var kakaoRestKey = "d405df36708ace0f0609039df30e8e80";
    var redirect_uri = "http://www.ezsmartfarm.com/kakaoOauth";

    var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    var options = {
        url: "https://kauth.kakao.com/oauth/token",
        method: 'POST',
        header: headers,
        form: {
            grant_type: "authorization_code",
            client_id: kakaoRestKey,
            redirect_uri: redirect_uri,
            code: code
        }
    }

    request(options, function(error, response, body) {
        consoleLog(error + response.statusCode);
        if (!error && response.statusCode == 200) {
            // API Access키 발급성공
            var jsonObj = JSON.parse(body);

            var access_token = jsonObj.access_token;
            var refresh_token = jsonObj.refresh_token;

            var options = {
                method: 'GET',
                url: 'https://kapi.kakao.com/v1/user/me',
                headers: {
                    authorization: 'Bearer ' + access_token,
                    'content-type': 'application/x-www-form-urlencoded'
                }
            };

            request(options, function(error, response, body) {

                if (!error && response.statusCode == 200) {
                    var jsonObj = JSON.parse(body);
                    var param = {
                        title: 'Express',
                        access_token: access_token,
                        refresh_token: refresh_token,
                        id: jsonObj.id
                    };

                    res.render('index', param);
                } else if (error) {
                    console.log("[error] : " + error);
                }
            });
        } else if (error) {
            console.log("[error] : " + error);
        }

    });

});

router.get('/check', function(req, res, next) {
    res.jsonp({
        "status": "ok"
    });
});


router.get('/value/recent/:sensor', function(req, res, next) {
    request(myServerIP + ":" + sensorServerPort + '/value/recent/serial/' + req.params.sensor, function(err, res2, body) {
        console.log(res2.statusCode);
        if (err === null && body !== null && body !== undefined && body !=="" && res2.statusCode===200) {
        var jsonObj = JSON.parse(body);
        console.log(jsonObj);
        console.log(jsonObj.id);
        console.log(jsonObj.value);
        var jsonObj1 = JSON.parse(jsonObj.value);
        console.log(jsonObj1.temperature);
            res.jsonp({
                temperature: jsonObj1.temperature,
                temperature_ds: jsonObj1.temperature_ds,
                humidity: jsonObj1.humidity,
                co2: jsonObj1.co2,
                light: jsonObj1.light,
                ec: jsonObj1.ec,
                ph: jsonObj1.ph,
                update_time: jsonObj.update_time,
                update_date: jsonObj.update_date
            });
        } else consoleLog(err);
    });
});


router.get('/list/:sensorName/:sensor/:date/one', function(req, res, next) {
    var query = 'list/' + req.params.sensorName + "/" + req.params.sensor + '/' + req.params.date + "/one";
    request(myServerIP + ":" + sensorServerPort + '/' + query, function(err, res2, body) {
        if (err === null) {
            if(body!==null && body !==undefined){
                var jsonObj = JSON.parse(body);
                for (i = 0; i < jsonObj.graphItems.length; i++) {
                    if (req.params.sensorName == "temperature") {
                        jsonObj.graphItems[i].temperature = decrypt(jsonObj.graphItems[i].temperature);
                    } else if (req.params.sensorName == "humidity") {
                        jsonObj.graphItems[i].humidity = decrypt(jsonObj.graphItems[i].humidity);
                    } else if (req.params.sensorName == "light") {
                        jsonObj.graphItems[i].light = decrypt(jsonObj.graphItems[i].light);
                    } else if (req.params.sensorName == "ec") {
                        jsonObj.graphItems[i].ec = decrypt(jsonObj.graphItems[i].ec);
                    } else if (req.params.sensorName == "ph") {
                        jsonObj.graphItems[i].ph = decrypt(jsonObj.graphItems[i].ph);
                    } else if (req.params.sensorName == "co2") {
                        jsonObj.graphItems[i].co2 = decrypt(jsonObj.graphItems[i].co2);
                    } else if (req.params.sensorName == "temperature_ds") {
                        jsonObj.graphItems[i].temperature_ds = decrypt(jsonObj.graphItems[i].temperature_ds);
                    }
                }
            }
            consoleLog(query + " :: complete");
            res.jsonp(jsonObj);
        } else {
            consoleLog(err);
            res.jsonp("error");
        }
    });
});


function decrypt(encrypted) {
    var str_encrypted = encrypted + "";
    var decipher = crypto.createDecipher('aes-128-ecb', 'pais'); //뒤에 키값 변경시 체크
    decipher.update(str_encrypted, 'hex', 'utf-8');
    return decipher.final('utf-8');
}


function consoleLog(log) {
    console.log('[' + moment().format('YYYY-MM-DD HH:mm:ss.SS') + '] ' + log);
}


module.exports = router;
