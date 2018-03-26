//============================================================================================
//각종 데이터 세팅
var roop;
function setDatas() {
    clearTimeout(roop);
    clearTimeout(roop_graph);
    //카메라
    refreshCameraImage();

    //현재 센서 값
    setSensorValues();

    //날씨
    setWeather();

    //그래프
    setGraph();

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
                var temperature = data.temperature;
                var humidity = data.humidity;
                var co2 = data.co2;
                var light = data.light;
                var ec = data.ec;
                var ph = data.ph;
                var temperature_ds = data.temperature_ds;

                update_date = new Date(update_date);
                var dd = update_date.getDate();
                var MM = update_date.getMonth()+1;
                var yy = update_date.getFullYear();
                update_date = yy+'-'+MM+'-'+dd;

                $("#currentInfo_label").html("실시간 미기후 정보 (" + update_date + " " + update_time.split(".")[0] + ")");
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

                roop = setTimeout("setSensorValues()", 60000);
            }
        },
        error: function(response, status, error) {
            console.log("sensor value loading failure : " + status + ", " + error);
        }
    });
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
// type : 카메라01, 카메라02 구분, 추가 : VPDHD 추가추가
function popupShow(type) {
    var camSrc;
    if (type == "cam01") {
        camSrc = $('#image_cam01').attr('src');
        $('#camStream').attr("src", camSrc);
        $('.ptz-pad-box').css("display", 'none');
    }
    else if (type == "cam02"){
        camSrc = $('#image_cam02').attr('src');
        $('#camStream').attr("src", camSrc);
        $('.ptz-pad-box').css("display", 'block');
    }

    if (camSrc == '../img/loading.gif') {
        $('#ptzPopup').css("width", '40%');
        $('.ptz-pad-box').css("display", 'none');
    } else {
        $('#ptzPopup').css("width", '');
    }

    $('#ptzPopup').fadeIn();
    $('#mask').fadeTo("slow", 0.8);
}



//카메라 이미지 리프레쉬
var isFirst = true;
var cam01_IP = "";
var cam01_Port = "";
var cam02_IP = "";
var cam02_Port = "";

function refreshCameraImage() {
    if (isFirst) {
        $('#image_cam01').attr("src", "../img/loading.gif");
        $('#image_cam02').attr("src", "../img/loading.gif");
        $('#popupImg').attr("src", "../img/loading.gif");
        isFirst = false;
    }

    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "camera/list/sensor/" + selectedSensor,
        type: "GET",
        dataType: "jsonp",
        success: function(response) {

            var imgRootPath = "../img/camera";

            if (response.url != null) {

                cam01_IP = response.data[0].url.split(":")[1].split("//")[1];
                cam01_Port = response.data[0].url.split(":")[2];

                $.ajax({
                    url: myServerIP + ":" + myServerCamPort + "/imgSave/" + cam01_IP + "/" + cam01_Port,
                    type: "GET",
                    dataType: "jsonp",
                    success: function(response) {
                        $('#image_cam01').attr("src", 'http://' + cam01_IP + ':' + cam01_Port + '/videostream.cgi?user=admin&pwd=0632551113' );
                    },
                    error: function(response, status, error) {
                        console.log("crop image loading failure : " + status + ", " + error);
                    }
                });
            } else $('#image_crop').attr("src", "../img/noImage.png");


            if (response.mosquito_url != null) {
                cam02_IP = response.data[1].url.split(":")[1].split("//")[1];
                cam02_Port = response.data[1].url.split(":")[2];

                $.ajax({
                    url: myServerIP + ":" + myServerCamPort + "/imgSave/" + cam02_IP + "/" + cam02_Port, //[TBD] 추후 아이피 포트 수정
                    type: "GET",
                    dataType: "jsonp",
                    success: function(response) {
                        $('#image_cam02').attr("src", 'http://' + cam02_IP + ':' + cam02_Port + '/videostream.cgi?user=admin&pwd=0632551113' );
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
