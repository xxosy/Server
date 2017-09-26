var myServerIP = "http://localhost";
var myServerPort = "80";
var myServerCamPort = "8084";
var sensorServerPort = "3000";
var sensorServerWeightPort = "3232";
var myServerDomain = "http://www.ezsmartfarm.com";

var cookie_accessToken = "accessToken";
var cookie_refreshToken = "refreshToken";
var cookie_usercode = "usercode";
var cookie_recentSensor = "recentSensor";
var cookie_recentWeight = "recentWeight";

// Get the Sidenav
var mySidenav = document.getElementById("mySidenav");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");


// Toggle between showing and hiding the sidenav, and add overlay effect
function w3_open() {
    if (mySidenav.style.display === 'block') {
        mySidenav.style.display = 'none';
        overlayBg.style.display = "none";
    } else {
        mySidenav.style.display = 'block';
        overlayBg.style.display = "block";
    }
}

// Close the sidenav with the close button
function w3_close() {
    mySidenav.style.display = "none";
    overlayBg.style.display = "none";
}

//============================================================================================

//사용자가 등록한 센서, 저울 시리얼 목록확인하여 보여줄 탭 정하기
function serialListCheck() {
    var url = myServerIP + ":" + sensorServerPort + "/usersensor/sensors/";
    var usercode = getCookie(cookie_usercode);
    var query = usercode;
    var signature = createhmac(query);
    $.ajax({
        dataType: "json",
        url: url + query,
        type: "GET",
        headers:{"x-signature":signature},
        success: function(response) {
            var countSensor = 0;
            var countWeight = 0;
            for (i = 0; i < response.length; i++) {
                if (response[i].serial != null && response[i].serial != "-") countSensor++;
                if (response[i].weight_serial != null && response[i].weight_serial != "-") countWeight++;
            }
        },
        error: function(response, status, error) {
            $('#tab-sensor').css("display", "none");
            $('#tab-weight').css("display", "none");
            $('#tab-journal').css("display", "none");
            showAddDevice();
        }
    });
}

//카카오 로그인 링크
function kakaoLogin() {
    location.replace(myServerDomain + "/kakaoLogin");
}

function kakaoLogout() {
    //카카오 로그아웃 처리
    $.ajax({
        dataType: "json",
        url: myServerDomain + "/kakaoLogout/" + getCookie(cookie_accessToken),
        type: "GET",
        success: function(response) {

            //쿠키 토큰 삭제
            deleteCookie(cookie_accessToken);
            deleteCookie(cookie_refreshToken);

            location.replace(myServerDomain);
        }
    });
}

//구글 지도 생성
//서버 URL 및 포트
var today;
var selectedSensor;
var selectedPosition;

var map = false;
var newSensorCount = 0;
function createhmac(query){
    var sharedSecret = "pais-access-secret";
    var hmac = new sjcl.misc.hmac(sjcl.codec.utf8String.toBits(sharedSecret), sjcl.hash.sha256);
    var signature = sjcl.codec.hex.fromBits(hmac.encrypt(query));
    return signature;
}
//CREATE-MAP////////////////////////////////////////////////////////////////////////////////////
function createMap() {
    $('#googleMap').html("");

    var date = new Date();
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    var dd = date.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    today = yyyy + "-" + mm + "-" + dd;

    var zoom = 13;
    if (getCookie("zoom") != "") {
        zoom = Number(getCookie("zoom"));
    }
    var latlng = new google.maps.LatLng(35.825, 127.15);
    var mapOptions = {
        zoom: zoom,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        streetViewControl: false
    }

    map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

    var url = myServerIP + ":" + sensorServerPort + "/usersensor/sensors/";
    var usercode = getCookie(cookie_usercode);
    var query = usercode;
    var signature = createhmac(query);
    $.ajax({
        dataType: "json",
        url: url + query,
        headers:{"X-Signature":signature},
        type: "GET",
        success: function(response) {
            for (i = 0; i < response.data.length; i++) {
                if (getCookie(cookie_recentSensor) == "") {
                    if (response.data[i].serial != "-") {
                        latlng = new google.maps.LatLng(parseFloat(response.data[i].lat), parseFloat(response.data[i].lng));
                        break;
                    }
                } else {
                    if (response.data[i].serial == getCookie(cookie_recentSensor)) {
                        latlng = new google.maps.LatLng(parseFloat(response.data[i].lat), parseFloat(response.data[i].lng));
                    }
                }
            }
            map.setCenter(latlng);

            google.maps.event.addListenerOnce(map, 'idle', function() {
                //맵 로딩이 완료된 후 실행할 함수 추가
            });

            map.addListener('zoom_changed', function() {
                setCookie("zoom", map.getZoom(), 30);
            });

            var markers = new Array();

            for (var i = 0; i < response.data.length; i++) {
                if (response.data[i].serial != "-") {
                    latlng = new google.maps.LatLng(parseFloat(response.data[i].lat), parseFloat(response.data[i].lng));

                    var serial = response.data[i].serial;
                    var title = response.data[i].name;

                    markers[i] = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: title + " [" + serial + "]"
                    });

                    markerListener(map, markers[i], title, serial);

                    if (getCookie(cookie_recentSensor) == serial) { //최근에 선택한 센서이면

                        var infowindow = new google.maps.InfoWindow({
                            content: "<div style='font-size:1.3em;color:#000;'>" +
                                "명　칭 : <b>" + title + "</b><br/>" +
                                "시리얼 : <b>" + serial + "</b></div>" +
                                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\");'>삭제</a>" +
                                "</div>",
                            maxWidth: 300
                        });

                        $("#notifySelect").hide();
                        prev_infowindow = infowindow;
                        infowindow.open(map, markers[i]);

                        map.setCenter(markers[i].getPosition());
                        selectedSensor = serial;
                        selectedPosition = Number(response.data[i].lat).toFixed(5) + ',' + Number(response.data[i].lng).toFixed(5);
                        setDatas();
                    }
                }
            }

            $("#sensorMap").css("height", "100%");
            $("sensorDiv").css("weight", "70%");
        },
        error: function(response, status, error) {
            console.log(response);
            console.log("실패 : " + status + ", " + error);
        }
    });
}

var prev_infowindow = false;

function markerListener(map, marker, title, serial) {
    google.maps.event.addListener(marker, 'click', function() {
        //센서 선택 요청 툴팁 지우기
        //$("#notifySelect").hide();

        var position = marker.position + "";
        var lat = (position.split('(')[1]).split(',')[0].trim();
        var lng = (position.split(')')[0]).split(',')[1].trim();
        position = lat + ',' + lng;
        selectedSensor = serial;
        selectedPosition = position;
        setDatas();

        if (prev_infowindow) prev_infowindow.close();

        var infowindow = new google.maps.InfoWindow({
            content: "<div style='font-size:1.3em;color:#000;'>" +
                "명　칭 : <b>" + title + "</b><br/>" +
                "시리얼 : <b>" + serial + "</b></div>" +
                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\")'>삭제</a>" +
                "</div>",
            maxWidth: 300
        });

        setCookie(cookie_recentSensor, serial, 30);
        prev_infowindow = infowindow;
        infowindow.open(map, marker);
    });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//date 의 yyyy-mm-dd(요일) 형태 반환
function getFormatingDate(date) {
    var week = new Array('일', '월', '화', '수', '목', '금', '토');

    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    var day = week[date.getDay()];

    return yyyy + '-' + mm + '-' + dd + ' (' + day + ')';
}
//date의 숫자형태의 값에서 hh:mm 형태 리턴
function getHourMin(dateData) {
    var date = new Date(dateData);
    var tmp = date.toUTCString(); //Fri, 24 Feb 2017 01:33:08 GMT 이런 형태로 변경

    var hh = tmp;
    var mm = ""; //tmp.split(' ')[4].split(':')[1];
    return hh + ":" + mm;
}

////////////////////////////////////////////////////////////
//차트 싱크로나이즈드 형태로 보여주기
/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */

function syncEvent() {
    var initValue = Highcharts.charts.length - 7; //그래프의 수가 6개가 넘어가면 영농일지 날씨 그래프가 껴있음(이걸 제외)
    $('#graph').bind('mousemove touchmove touchstart', function(e) {
        var chart,
            point,
            i,
            event;

        for (i = Highcharts.charts.length - 7; i < Highcharts.charts.length; i++) {
            chart = Highcharts.charts[i];
            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
            point = chart.series[0].searchPoint(event, true); // Get the hovered point

            if (point) {
                point.highlight(e);
            }
        }
    });

    /**
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    Highcharts.Pointer.prototype.reset = function() {
        return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function(event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };
}


/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        for (i = Highcharts.charts.length - 7; i < Highcharts.charts.length; i++) {
            chart = Highcharts.charts[i];

            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
                        trigger: 'syncExtremes'
                    });
                }
            }
        }
    }
}

// 하이차트 옵션 세팅
function setHighchartsOption() {
    Highcharts.setOptions({
        lang: {
            shortMonths: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
            weekdays: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
        }
    });
}


//컴포넌트 열기/닫기 토글 함수
function showComponentToggle(componentId, iconId) {
    var component = $('#' + componentId);
    var icon = $('#' + iconId);

    if (component.css('display') == 'none') {
        component.show(280);
        icon.removeClass("fa-plus-square-o");
        icon.addClass("fa-minus-square-o");
    } else {
        component.hide(280);
        icon.removeClass("fa-minus-square-o");
        icon.addClass("fa-plus-square-o");
    }
}

//제품 삭제
function deleteDevice(serial) {
    //서버로 제품 삭제 요청
    if (confirm(serial + ' 제품을 삭제하시겠습니까?')) {
        var usercode = getCookie(cookie_usercode);
        var query = usercode;
        var signature = createhmac(query);
        $.ajax({
            url: myServerIP + ":" + sensorServerPort + "/usersensor/serial/" + serial + "/usercode/" + usercode,
            type: "DELETE",
            dataType: "json",
            headers:{"x-signature":signature},
            success: function(response) {
                prev_infowindow.close();

                if (document.location.href.indexOf("weight") != -1) createMapWeight();
                else createMap();
            },
            error: function(response, status, error) {}
        });
    } else {
        // Do nothing!
    }
}

//제품 등록
var prev_addwindow = false;
var prev_addmarker = false;

function showAddDevice() {
    $('#serialMask').fadeTo("slow", 1);
}

function clickInsert(){
    var serial = $('#serial2insert').val();
    popupClose();
    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "/sensor/" + serial,
        type: "GET",
        dataType: "json",
        success: function(response) {
            if(response.statecode === 200){
                if(response.data.lat === null || response.data.lat === undefined || response.data.lat ===""){
                    selectPosition(serial);
                }else{
                    addDevice(serial);
                }
            }else if(response.statecode === 404){
                alert("환경센서 시리얼번호가 유효하지 않습니다.");
            }
        },
        error: function(response, status, error) {
            console.log(status + error);
        },
        complete:function(){
            
        }
    });
}

function selectPosition(serial){
    $('#addDeviceMask').fadeTo("slow", 1);

    var zoom = 13;
    if (getCookie("zoom") != "") {
        zoom = Number(getCookie("zoom"));
    }

    var mapOptions = {
        zoom: zoom,
        center: {
            lat: 35.4389616, //나중에 현좌표로 바꿔야함
            lng: 127.5281028
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false
    }

    map = new google.maps.Map(document.getElementById('addDeviceMap'), mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function() {
        //맵 로딩이 완료된 후 실행할 함수 추가
    });

    map.addListener('zoom_changed', function() {
        setCookie("zoom", map.getZoom(), 30);
    });

    map.addListener('click', function(event) {
        if (prev_addwindow) {
            prev_addwindow.close();
            prev_addmarker.setMap(null);
        }
        var latlng = new google.maps.LatLng(event.latLng.lat(), event.latLng.lng());
        var marker = new google.maps.Marker({
            position: latlng,
            map: this,
            title: "새 지점"
        });
        var addwindow = new google.maps.InfoWindow({
            content: "<div style='font-size:1.3em;color:#000;text-align:center;'><p>새 제품 등록</p>" +
                "제품번호 : <input type='text' id='addSerial' value='" + serial + "' readonly/> <br>" +
                "제품번호 : <input type='text' id='addTitle' value=''/> <br>" +
                "위　　도 : <input type='text' id='addLat' value='" + event.latLng.lat() + "' readonly/> <br>" +
                "경　　도 : <input type='text' id='addLng' value='" + event.latLng.lng() + "' readonly/> <br>" +
                "<input type='button' id='' onclick='updateDevice()' style='margin-top:1em;' value='등록'/> <br>" +
                "</div>",
            maxWidth: 300
        });
        addwindow.open(this, marker);
        prev_addwindow = addwindow;
        prev_addmarker = marker;

        google.maps.event.addListener(marker, 'click', function() {
            prev_addwindow.open(this, prev_addmarker);
        });
    });
}
function updateDevice() {
    var lat = $('#addLat').val();
    var lng = $('#addLng').val();
    var serial = $('#addSerial').val();
    var title = $('#addTitle').val();
    setTimeout(function() {
        $.ajax({
            url:myServerIP+":"+sensorServerPort+"/sensor/update/serial/"+serial,
            type: "POST",
            dataType: "json",
            data:{
                "lat":lat,
                "lng":lng,
                "title":title
            },
            success: function(response){
                addDevice(serial);
            },
            error: function(response,status,error){
                console.log(error);
            }
        });


    }, 500);
}
function addDevice(serial){
    $.ajax({
        url:myServerIP+":"+sensorServerPort+"/usersensor/serial/"+serial+"/usercode/"+getCookie(cookie_usercode),
        type: "POST",
        dataType: "json",
        success: function(response){
            console.log(response);
        },
        error: function(response,status,error){}
    });
    setTimeout(function() {
        alert("[" + serial + "] 제품 등록이 완료되었습니다.");
        popupClose();
        if (document.location.href.indexOf("weight") != -1) createMapWeight();
        else createMap();
    }, 300);
}
function popupClose() {
    $('#popup').fadeOut();
    $('#mask').fadeOut();
    $('#addDeviceMask').fadeOut();
    $('#serialMask').fadeOut();
}

//onclick 겹치지 않게 처리해주는 함수
function voidFunction() {}
