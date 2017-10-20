//============================================================================================
//각종 데이터 세팅
function setDatas() {

    //카메라
    refreshCameraImage();

    //현재 센서 값
    setSensorValues();

    //날씨
    setWeather();

    //그래프
    setGraph(selectedSensor, today);

    //VPDHD 이벤트 등록
    changeRangeValue();

    //setTimeout("refreshLoop()", 5000);
}

function refreshLoop() {
    refreshCameraImage();
    //setGraph(selectedSensor, today);
    setTimeout("refreshLoop()", 300000);
}

//============================================================================================
//현재 센서 값 세팅
function setSensorValues() {
    var status_good = '<i class="material-icons" style="color:#88F;">sentiment_very_satisfied</i>';
    var status_bad = '<i class="material-icons" style="color:#F88;">sentiment_very_dissatisfied</i>';
    var status_bad_up = '<i class="material-icons" style="color:#F88;">arrow_upward</i>';
    var status_bad_down = '<i class="material-icons" style="color:#F88;">arrow_downward</i>';
    var query = selectedSensor;
    var signature = createhmac(query);
    var recentValueQuery = "value/recent/serial/" + selectedSensor;
    $.ajax({
        dataType: "json",
        url: myServerIP + ":" + sensorServerPort + "/" + recentValueQuery,
        type: "GET",
        headers:{"X-Signature":signature},
        success: function(response) {
            if(response.statecode === 200){
                var data = response.data;
                var update_time = data.update_time;
                var update_date = data.update_date;
                var value = data.value;
                var recent = JSON.parse(value);
                var temperature = recent.temperature;
                var humidity = recent.humidity;
                var co2 = recent.co2;
                var light = recent.light;
                var ec = recent.ec;
                var ph = recent.ph;
                var temperature_ds = recent.temperature_ds;

                $("#currentInfo_label").html("실시간 미기후 정보 (" + update_date + " " + update_time + ")");
                $("#temperature").html(Number(temperature).toFixed(2) + " ℃");
                $("#humidity").html(Number(humidity).toFixed(2) + " %");
                $("#co2").html(Number(co2).toFixed(2) + " ppm");
                $("#light").html((Number(light)*2.7).toFixed(2) + " lux");
                $("#ec").html(Number(ec).toFixed(2) + " ms/cm");
                $("#ph").html(Number(ph).toFixed(2) + " ph");
                $("#ds").html(Number(temperature_ds).toFixed(2) + " ℃");

                var pressure = 1013;
                var dryTemp = Number(temperature);
                var humidity = Number(humidity);
                var wetTemp = getWetTemperature(dryTemp, pressure, humidity);

                $("#wetTemp").html(wetTemp.toFixed(2) + " ℃");
                $("#dew").html(getDEW(dryTemp, wetTemp, pressure).toFixed(2) + " ℃");
                $("#HD").html(getHD(humidity, dryTemp).toFixed(2) + " g/m³");
                $("#VPD").html(getVPD(dryTemp, wetTemp, pressure, humidity).toFixed(2) + " kPa");

                //[TBD] 적정곡선값과 비교해서 할당해야함(적당한지, 높은지, 낮은지)
                $("#temperature_condition_icon").html(status_good);
                $("#humidity_condition_icon").html(status_good);
                $("#co2_condition_icon").html(status_good);
                $("#light_condition_icon").html(status_good);
                $("#ec_condition_icon").html(status_bad);
                $("#ph_condition_icon").html(status_good);
                $("#ds_condition_icon").html(status_good);

                $("#wetTemp_condition_icon").html(status_good);
                $("#dew_condition_icon").html(status_good);


                $("#HD_condition_icon").html(status_good);
                $("#VPD_condition_icon").html(status_good);

                $('#VPDHD_temp').html("온도 : " + dryTemp.toFixed(0) + " ℃");
                $('#VPDHD_humi').html("습도 : " + humidity.toFixed(0) + " %");

                $('#VPDHD_rangeTemp').val(dryTemp.toFixed(0));
                $('#VPDHD_rangeHumi').val(humidity.toFixed(0));

                var hd = getHD(humidity, dryTemp).toFixed(2);
                var vpd = getVPD(dryTemp, wetTemp, pressure, humidity).toFixed(2);
                if (hd >= 3 && hd <= 8) {
                    $("#HD_condition_icon").html(status_good);
                } else {
                    $("#HD_condition_icon").html(status_bad);
                    if (hd < 3) {
                        var gap = 3 - hd;
                        $("#HD_condition_value").html(status_bad_down + gap.toFixed(2) + "g/m³");
                    } else {
                        var gap = hd - 8;
                        $("#HD_condition_value").html(status_bad_up + gap.toFixed(2) + "g/m³");
                    }
                }

                if (vpd >= 0.5 && vpd <= 1.2) {
                    $("#VPD_condition_icon").html(status_good);
                } else {
                    $("#VPD_condition_icon").html(status_bad);
                    if (vpd < 0.5) {
                        var gap = 0.5 - vpd;
                        $("#VPD_condition_value").html(status_bad_down + gap.toFixed(2) + "kPa");
                    } else {
                        var gap = vpd - 1.2;
                        $("#VPD_condition_value").html(status_bad_up + gap.toFixed(2) + "kPa");
                    }
                }

                setVPDHD(dryTemp, humidity);

                setTimeout("setSensorValues()", 60000);
            }
        },
        error: function(response, status, error) {
            console.log("sensor value loading failure : " + status + ", " + error);
        }
    });
}
//============================================================================================
//날씨 세팅
function setWeather() {
    $.simpleWeather({
        location: selectedPosition,
        woeid: '',
        unit: 'c',
        success: function(weather) {

            //오늘 날씨 갱신
            $("#weatherImage_0").html('<img style="width:auto;height:7em;display:block;margin-left:auto;margin-right:auto;" src="' +
                getImageSrc(weather.code) + '" title="' + getWeatherText(weather.code) + '" />');
            $("#temperature_0").html(weather.temp + '&deg;' + weather.units.temp + '　' + weather.humidity + '%');
            $("#temperatureHL_0").html('↑' + weather.high + '℃ ↓' + weather.low + '℃<br />' + weather.sunrise + ", " + weather.sunset);
            $("#wind_0").html(translateWindDirection(weather.wind.direction) + ' ' + weather.wind.speed + ' ' + weather.units.speed);

            //1일후 ~ 4일후 예보 갱신
            var todayDate = new Date();
            var onedayTerm = 24 * 60 * 60 * 1000;

            for (i = 1; i <= 4; i++) {
                $("#forecastDate_" + i).html('<b>' + getFormatingDate(new Date(todayDate.valueOf() + (onedayTerm * i))) + '</b>');
                $("#weatherImage_" + i).html('<img style="width:100%;height:100%;display:block;margin-left:auto;margin-right:auto;" src="' +
                    getImageSrc(weather.forecast[i].code) + '" title="' + getWeatherText(weather.forecast[i].code) + '" />');
                $("#temperatureHL_" + i).html('<b>↑' + weather.forecast[i].high + '℃ ↓' + weather.forecast[i].low + '℃</b>');
            }

        },
        error: function(error) {
            $("#weather").html('<p>' + error + '</p>');
        }
    });
}

//영어(WS)로 오는 바람 방향을 한글(서남)로 번역
function translateWindDirection(dir) {
    //STring.charAt() 사용
    var result = "";
    for (i = 0; i < dir.length; i++) {
        var c = dir.charAt(i);

        switch (c) {
            case 'E':
                result += "동";
                break;
            case 'W':
                result += "서";
                break;
            case 'N':
                result += "북";
                break;
            case 'S':
                result += "남";
                break;
        }
    }

    return result;
}

//코드에 해당하는 별도로 만든 이미지의 경로 불러오기
function getImageSrc(code) {
    return 'img/weather/' + code + '.png';
}

//코드에 해당하는 기후 텍스트 반환
var arrWeatherText = new Array('폭풍', '열대성 폭풍', '허리케인', '심한 뇌우', '뇌우', '비/눈', '비/진눈깨비', '눈/진눈깨비', '결빙성 이슬비(진눈깨비)', '이슬비',
    '어는비', '소나기', '소나기', '약간의 눈', '가벼운 소나기성 눈', '불어 오는 눈*', '눈', '우박', '진눈깨비', '먼지', '안개', '실안개',
    '안개(자욱한)', '거센 바람', '많은 바람', '추움', '흐림', '흐림', '흐림', '부분적으로 흐림', '부분적으로 흐림', '맑음', '맑음', '좋음',
    '좋음', '비/우박', '더움', '국지성 뇌우', '산발성 뇌우', '산발성 뇌우', '산발성 소나기', '폭설', '산발성 소나기눈', '폭설',
    '부분적으로 흐림', '뇌우', '소나기성 눈', '국지성 뇌우');

function getWeatherText(code) {
    if (code < 0 || code >= arrWeatherText.length) return '사용 불가';
    else return arrWeatherText[code];
}

//온습도에 따른 HD 값과 VPD 값 구하는 부분에서 range 바 값 변경시 일어나는 이벤트함수 등록
//type : temp, humi
function changeRangeValue() {
    $(document).on('input', '#VPDHD_rangeTemp', function() {
        $('#VPDHD_temp').html("온도 : " + $(this).val() + " ℃");

        var dryTemp = Number($(this).val());
        var humidity = Number($('#VPDHD_humi').html().split(' ')[2]);
        setVPDHD(dryTemp, humidity);
    });
    $(document).on('input', '#VPDHD_rangeHumi', function() {
        $('#VPDHD_humi').html("습도 : " + $(this).val() + " %");

        var dryTemp = Number($('#VPDHD_temp').html().split(' ')[2]);
        var humidity = Number($(this).val());
        setVPDHD(dryTemp, humidity);
    });
}

function setVPDHD(dryTemp, humidity) {

    var pressure = 1013;
    var wetTemp = getWetTemperature(dryTemp, pressure, humidity);

    var hd = getHD(humidity, dryTemp).toFixed(2);
    var vpd = getVPD(dryTemp, wetTemp, pressure, humidity).toFixed(2);
    $('#VPDHD_HD').html("HD : " + hd + " g/m³");
    $('#VPDHD_VPD').html("VPD : " + vpd + " kPa");

    var condition, solution;
    if(vpd>1.2) {
        condition = "<h1 style='color:#ff6600'>건조</h1>";
        solution = "현재 온도에서 </br> <h3 style='display:inline; color:#33ccff'>가습</h3>이 필요합니다."
    } else if(vpd>0.5) {
        condition = "<h1 style='color:#33cc33'>적정</h1>"
        solution = "작물이 생장하는데 최적의 환경입니다."
    } else {
        condition = "<h1 style='color:#0099ff'>과습</h1>";
        solution = "현재 온도에서 </br> <h3 style='display:inline; color:#ff9933'>제습</h3>이 필요합니다."
    }

    $('#greenhouseCondition').html(condition);
    $('#solution').html(solution);
}

function initVPDHD() {
    var dryTemp = Number($('#temperature').html().split(' ')[0]);
    var humidity = Number($('#humidity').html().split(' ')[0]);
    $('#VPDHD_temp').html("온도 : " + dryTemp.toFixed(0) + " ℃");
    $('#VPDHD_humi').html("습도 : " + humidity.toFixed(0) + " %");

    $('#VPDHD_rangeTemp').val(dryTemp.toFixed(0));
    $('#VPDHD_rangeHumi').val(humidity.toFixed(0));

    setVPDHD(dryTemp, humidity);
}

// 팝업 , 불투명 배경 띄우기
// type : 작물카메라, 해충카메라 구분, 추가 : VPDHD 추가추가
function popupShow(type) {
    if (type == "crop") $('#popupImg').attr("src", "../img/camera/" + cropIP + "." + cropPORT + ".png");
    else if (type == "bug") $('#popupImg').attr("src", "../img/camera/" + bugIP + "." + bugPORT + ".png");

    $('#popup').fadeIn();
    $('#mask').fadeTo("slow", 0.8);
}



//카메라 이미지 리프레쉬
var isFirst = true;
var cropIP = "";
var cropPORT = "";
var bugIP = "";
var bugPORT = "";

function refreshCameraImage() {
    if (isFirst) {
        $('#image_crop').attr("src", "../img/loading.gif");
        $('#image_bug').attr("src", "../img/loading.gif");
        $('#popupImg').attr("src", "../img/loading.gif");
        isFirst = false;
    }

    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "/sensor/" + selectedSensor,
        type: "GET",
        dataType: "jsonp",
        success: function(response) {

            var imgRootPath = "../img/camera";

            if (response.url != null) {

                cropIP = response.url.split(":")[1].split("//")[1];
                cropPORT = response.url.split(":")[2];

                $.ajax({
                    url: myServerIP + ":" + myServerCamPort + "/imgSave/" + cropIP + "/" + cropPORT,
                    type: "GET",
                    dataType: "jsonp",
                    success: function(response) {
                        $('#image_crop').attr("src", imgRootPath + "/" + cropIP + "." + cropPORT + ".png");
                    },
                    error: function(response, status, error) {
                        console.log("crop image loading failure : " + status + ", " + error);
                    }
                });
            } else $('#image_crop').attr("src", "../img/noImage.png");


            if (response.mosquito_url != null) {
                bugIP = response.mosquito_url.split(":")[1].split("//")[1];
                bugPORT = response.mosquito_url.split(":")[2];

                $.ajax({
                    url: myServerIP + ":" + myServerCamPort + "/imgSave/" + bugIP + "/" + bugPORT, //[TBD] 추후 아이피 포트 수정
                    type: "GET",
                    dataType: "jsonp",
                    success: function(response) {
                        $('#image_bug').attr("src", imgRootPath + "/" + bugIP + "." + bugPORT + ".png");
                    },
                    error: function(response, status, error) {
                        console.log("bug image loading failure : " + status + ", " + error);
                    }
                });
            } else $('#image_bug').attr("src", "../img/noImage.png");

        },
        error: function(response, status, error) {

        }
    });
}



function test() {
    $.ajax({
        url: "http://112.184.93.4:3000/actuator/asjodwjz",
        type: "POST",
        dataType: "json",
        data: {
            "serial": "test"
        },
        success: function(response) {
            alert("성공");
        },
        error: function(response, status, error) {
            console.log("sensor value loading failure : " + status + ", " + error);
        }
    });
}
