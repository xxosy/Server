var myServerIP = "http://211.230.136.100";
var myServerPort = "80";
var myServerCamPort = "8084";
var sensorServerPort = "3000";
var sensorServerWeightPort = "3232";
var myServerDomain = "http://211.230.136.100";

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
    var url = myServerIP + ":" + sensorServerPort + "/map/sensor/";
    var usercode = getCookie(cookie_usercode);

    $.ajax({
        dataType: "jsonp",
        url: url + usercode,
        type: "GET",
        success: function(response) {
            var countSensor = 0;
            var countWeight = 0;
            for (i = 0; i < response.length; i++) {
                if (response[i].serial != null && response[i].serial != "-") countSensor++;
                if (response[i].weight_serial != null && response[i].weight_serial != "-") countWeight++;
            }

            if (countSensor == 0) {
                $('#tab-sensor').attr("href", "#");
                $('#tab-sensor').css("color", "#777");
                $('#tab-sensor').removeClass("w3-hover-black");
            } else if (countSensor != 0) {
                $('#tab-sensor').attr("href", "http://www.ezsmartfarm.com/en");
                $('#tab-sensor').css("color", "#FFF");
                $('#tab-sensor').addClass("w3-hover-black");
            }

            if (countWeight == 0) {
                $('#tab-weight').attr("href", "#");
                $('#tab-weight').css("color", "#777");
                $('#tab-weight').removeClass("w3-hover-black");

            } else if (countWeight != 0) {
                $('#tab-weight').attr("href", "http://www.ezsmartfarm.com/en/weight");
                $('#tab-weight').css("color", "#FFF");
                $('#tab-weight').addClass("w3-hover-black");
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
        dataType: "jsonp",
        url: myServerDomain + "/kakaoLogout/" + getCookie(cookie_accessToken),
        type: "GET",
        success: function(response) {

            //쿠키 토큰 삭제
            deleteCookie(cookie_accessToken);
            deleteCookie(cookie_refreshToken);

            location.replace(myServerIP);
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

    var url = myServerIP + ":" + sensorServerPort + "/map/sensor/";
    var usercode = getCookie(cookie_usercode);

    $.ajax({
        dataType: "jsonp",
        url: url + usercode,
        type: "GET",
        success: function(response) {
            for (i = 0; i < response.length; i++) {
                if (getCookie(cookie_recentSensor) == "") {
                    if (response[i].serial != "-") {
                        latlng = new google.maps.LatLng(parseFloat(response[i].lat), parseFloat(response[i].lng));
                        break;
                    }
                } else {
                    if (response[i].serial == getCookie(cookie_recentSensor)) {
                        latlng = new google.maps.LatLng(parseFloat(response[i].lat), parseFloat(response[i].lng));
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

            for (var i = 0; i < response.length; i++) {
                if (response[i].serial != "-") {
                    latlng = new google.maps.LatLng(parseFloat(response[i].lat), parseFloat(response[i].lng));

                    var serial = response[i].serial;
                    var title = response[i].title;

                    markers[i] = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: title + " [" + serial + "]"
                    });

                    markerListener(map, markers[i], title, serial);

                    if (getCookie(cookie_recentSensor) == serial) { //최근에 선택한 센서이면

                        var infowindow = new google.maps.InfoWindow({
                            content: "<div style='font-size:1.3em;color:#000;'>" +
                                "Title  : <b>" + title + "</b><br/>" +
                                "Serial : <b>" + serial + "</b></div>" +
                                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\");'>Delete</a>" +
                                "</div>",
                            maxWidth: 300
                        });

                        $("#notifySelect").hide();
                        prev_infowindow = infowindow;
                        infowindow.open(map, markers[i]);

                        map.setCenter(markers[i].getPosition());
                        selectedSensor = serial;
                        selectedPosition = Number(response[i].lat).toFixed(5) + ',' + Number(response[i].lng).toFixed(5);
                        setDatas();
                    }
                }
            }

            $("#sensorMap").css("height", "100%");
            $("sensorDiv").css("weight", "70%");
        },
        error: function(response, status, error) {
            console.log("Failure : " + status + ", " + error);
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
                "Title  : <b>" + title + "</b><br/>" +
                "Serial : <b>" + serial + "</b></div>" +
                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\")'>Delete</a>" +
                "</div>",
            maxWidth: 300
        });

        setCookie(cookie_recentSensor, serial, 30);
        prev_infowindow = infowindow;
        infowindow.open(map, marker);
    });
}

//date 의 yyyy-mm-dd(요일) 형태 반환
function getFormatingDate(date) {
    var week = new Array('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');

    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    var day = week[date.getDay()];

    return yyyy + '-' + mm + '-' + dd + ' (' + day + ')';
}

//============================================================================================
//그래프 세팅
//그래프 들어갈 div 아이디 : graph
var sensors = new Array();
sensors[0] = 'temperature';
sensors[1] = 'humidity';
sensors[2] = 'light';
sensors[3] = 'co2';
sensors[4] = 'ph';
sensors[5] = 'ec';
sensors[6] = 'temperature_ds';

function setGraph(selectedSensor, date) {
    var year = Number(date.split('-')[0]);
    var month = Number(date.split('-')[1]);
    var day = Number(date.split('-')[2]);

    var datas = new Array(); //0~5 위에 순서대로
    var flgGraphData = 0;


    for (i = 0; i < sensors.length; i++) {
        // 형식 : /list/:factor/:serial/:date/one
        var graphDataQuery = "list/" + sensors[i] + "/" + selectedSensor + "/" + date + "/one";

        $.ajax({
            dataType: "jsonp",
            url: myServerDomain + "/" + graphDataQuery, //[TBD]추후 baseURL 로 교체해야함 (현재 복호화때문에 별도 서버 우회중, 교체 후 값사용 시 복호화 해서 사용해야함)
            type: "GET",
            success: function(response) {
                var currentSensorIndex = 0;

                for (j = 0; j < response.graphItems.length; j++) {
                    var item = response.graphItems[j];

                    var hour = Number(item.update_time.split(':')[0]);
                    var min = Number(item.update_time.split(':')[1]);
                    var value = 0;

                    if (j == 0) {
                        if (item.temperature != null) currentSensorIndex = 0;
                        else if (item.humidity != null) currentSensorIndex = 1;
                        else if (item.light != null) currentSensorIndex = 2;
                        else if (item.co2 != null) currentSensorIndex = 3;
                        else if (item.ph != null) currentSensorIndex = 4;
                        else if (item.ec != null) currentSensorIndex = 5;
                        else if (item.temperature_ds != null) currentSensorIndex = 6;

                        datas[currentSensorIndex] = new Array();
                    }

                    switch (currentSensorIndex) {
                        case 0:
                            value = Number(item.temperature);
                            break;
                        case 1:
                            value = Number(item.humidity);
                            break;
                        case 2:
                            value = Number(item.light);
                            value = value*2.7;
                            break;
                        case 3:
                            value = Number(item.co2);
                            break;
                        case 4:
                            value = Number(item.ph);
                            break;
                        case 5:
                            value = Number(item.ec);
                            break;
                        case 6:
                            value = Number(item.temperature_ds);
                            break;
                    }

                    datas[currentSensorIndex][j] = [Date.UTC(year, month - 1, day, hour, min, 0), value];
                }

                //칼만 사용하면 위에꺼 안하면 아래꺼 사용
                if (response.graphItems.length > 0) datas[currentSensorIndex] = kalman(datas[currentSensorIndex]);
                //if (response.graphItems.length > 0) datas[currentSensorIndex] = datas[currentSensorIndex];

                flgGraphData++;

                if (flgGraphData == sensors.length) {
                    flgGraphData = 0;

                    var humidityDatas = new Array();

                    humidityDatas[0] = datas[0];
                    humidityDatas[1] = datas[1];
                    humidityDatas[2] = new Array(); //이슬점
                    humidityDatas[3] = new Array(); //HD
                    humidityDatas[4] = new Array(); //VPD

                    if (response.graphItems.length > 0) {
                        for (j = 0; j < datas[0].length; j++) {
                            var pressure = 1013; //[TBD] 추후 다르게 수집한 기압 대입 해야함
                            var dryTemp = datas[0][j][1];
                            var humidity = datas[1][j][1];
                            var wetTemp = getWetTemperature(dryTemp, pressure, humidity);

                            humidityDatas[2][j] = [datas[0][j][0], getDEW(dryTemp, wetTemp, pressure)];
                            humidityDatas[3][j] = [datas[0][j][0], getHD(humidity, dryTemp)];
                            humidityDatas[4][j] = [datas[0][j][0], getVPD(dryTemp, wetTemp, pressure, humidity)];
                        }
                    }

                    drawGraphAll(datas);
                    drawGraphAirHumidity(humidityDatas);

                    drawVPDHD(humidityDatas[4], humidityDatas[3]);
                    drawPieChart(humidityDatas[4], humidityDatas[3]);

                    drawGraph(datas);
                }
            },
            error: function(response, status, error) {
                console.log("sensor value loading failure : " + status + ", " + error);
            }
        });
    }
}

//ajax 통신의 success 콜백 발생시간의 시간차때문에 모든 데이터 수신후 아래 함수 호출하여 전체 그래프 생성
//var flgReRequest = false;	//수신데이터가 부족할경우 한번더 요청해보도록
var isFirstDraw = true; //처음 그릴때 싱크로나이즈드 그래프 마우스 이벤트 등록 여부 관련 플래그
function drawGraph(datas) {
    $('#graph').html('');

    for (i = 0; i < 7; i++) {

        var title = sensors[i];
        var valueSuffix = " ";
        switch (i) {
            case 0:
                valueSuffix += "℃";
                title = "Temperature";
                break;
            case 1:
                valueSuffix += "%";
                title = "Humidity";
                break;
            case 2:
                valueSuffix += "㏓";
                title = "Illumination";
                break;
            case 3:
                valueSuffix += "ppm";
                title = "CO₂";
                break;
            case 4:
                valueSuffix += "ph";
                title = "PH";
                break;
            case 5:
                valueSuffix += "ms/cm";
                title = "EC";
                break;
            case 6:
                valueSuffix += "℃";
                title = "Soil Temperature";
                break;
        }


        $('<div class="chart" style="margin-top:1em;">')
            .appendTo('#graph')
            .highcharts({
                chart: {
                    marginLeft: 40, // Keep all charts left aligned
                    spacingTop: 10,
                    spacingBottom: 10,
                    backgroundColor: 'rgba(0,0,0,0)',
                    zoomType: 'x'
                },
                title: {
                    text: title,
                    align: 'left',
                    margin: 0,
                    x: 30,
                    style: {
                        fontSize: '1.3em',
                        color: '#FFFFFF'
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    crosshair: true,
                    type: 'datetime',
                    events: {
                        setExtremes: syncExtremes
                    }
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: {
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: 1
                            },
                            stops: [
                                [0, Highcharts.Color(Highcharts.getOptions().colors[i + 3]).setOpacity(0.8).get('rgba')],
                                [1, Highcharts.Color(Highcharts.getOptions().colors[i + 3]).setOpacity(0.05).get('rgba')]
                            ]
                        },
                        marker: {
                            radius: 2
                        },
                        lineWidth: 1,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        threshold: null
                    }
                },
                tooltip: {
                    positioner: function() {
                        return {
                            x: this.chart.chartWidth - this.label.width - 10, // right aligned
                            y: -1 // align to title
                        };
                    },
                    valueDecimals: 2,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    headerFormat: '{point.key}',
                    pointFormat: '　{point.y}',
                    shadow: false,
                    style: {
                        fontSize: '1.3em',
                        color: '#FFFFFF'
                    }
                },
                series: [{
                    type: 'area',
                    data: datas[i],
                    color: Highcharts.getOptions().colors[i + 3],
                    fillOpacity: 0.3,
                    tooltip: {
                        valueSuffix: valueSuffix
                    }
                }],
                exporting: {
                    enabled: false
                }
            });
    }

    if (isFirstDraw) {
        isFirstDraw = false;
        syncEvent();
    }

}

function drawGraphAll(datas) {
    Highcharts.chart('graphAll', {
        chart: {
            zoomType: 'x',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: ''
        },
        legend: {
            // enabled: false
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            },
            itemHiddenStyle: {
                color: '#888'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: [{
            type: 'datetime',
            crosshair: true
        }],
        yAxis: [{
            labels: {
                format: '{value} °C',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Temperature',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, {
            title: {
                text: 'Humidity',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} %',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, {
            title: {
                text: 'Illumination',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            },
            labels: {
                format: '{value} ㏓',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            }
        }, {
            labels: {
                format: '{value} ppm',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            title: {
                text: 'CO₂',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            opposite: true

        }, {
            title: {
                text: 'PH',
                style: {
                    color: Highcharts.getOptions().colors[5]
                }
            },
            labels: {
                format: '{value} PH',
                style: {
                    color: Highcharts.getOptions().colors[5]
                }
            }

        }, {
            title: {
                text: 'EC',
                style: {
                    color: Highcharts.getOptions().colors[6]
                }
            },
            labels: {
                format: '{value} ms/cm',
                style: {
                    color: Highcharts.getOptions().colors[6]
                }
            }
        }, {
            title: {
                text: 'Soil Temperature',
                style: {
                    color: Highcharts.getOptions().colors[7]
                }
            },
            labels: {
                format: '{value} °C',
                style: {
                    color: Highcharts.getOptions().colors[7]
                }
            }
        }],
        tooltip: {
            valueDecimals: 2,
            shared: true
        },
        series: [{
            name: 'Temperature',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: datas[0],
            tooltip: {
                valueSuffix: ' °C'
            }

        }, {
            name: 'Humidity',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: datas[1],
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: 'Illumination',
            type: 'area',
            color: Highcharts.getOptions().colors[3],
            fillOpacity: 0,
            yAxis: 2,
            data: datas[2],
            tooltip: {
                valueSuffix: ' ㏓'
            }
        }, {
            name: 'CO₂',
            type: 'area',
            color: Highcharts.getOptions().colors[4],
            fillOpacity: 0,
            yAxis: 3,
            data: datas[3],
            tooltip: {
                valueSuffix: ' ppm'
            }

        }, {
            name: 'PH',
            type: 'area',
            color: Highcharts.getOptions().colors[5],
            fillOpacity: 0,
            yAxis: 4,
            data: datas[4],
            tooltip: {
                valueSuffix: ' PH'
            }

        }, {
            name: 'EC',
            type: 'area',
            color: Highcharts.getOptions().colors[6],
            fillOpacity: 0,
            yAxis: 5,
            data: datas[5],
            tooltip: {
                valueSuffix: ' ms/cm'
            }
        }, {
            name: 'Soil Temperature',
            type: 'area',
            color: Highcharts.getOptions().colors[6],
            fillOpacity: 0,
            yAxis: 6,
            data: datas[6],
            tooltip: {
                valueSuffix: ' °C'
            }
        }]
    });
}

function drawGraphAirHumidity(datas) {
    Highcharts.chart('graphAirHumidity', {
        chart: {
            zoomType: 'x',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: ''
        },
        legend: {
            // enabled: false
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            },
            itemHiddenStyle: {
                color: '#888'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        xAxis: [{
            type: 'datetime',
            crosshair: true
        }],
        yAxis: [{
            labels: {
                format: '{value} °C',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            title: {
                text: 'Temperature',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, {
            title: {
                text: 'Humidity',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} %',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, {
            title: {
                text: 'Dew Point',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            },
            labels: {
                format: '{value} °C',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            }
        }, {
            labels: {
                format: '{value} g/m³',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            title: {
                text: 'Humidity Deficit(HD)',
                style: {
                    color: Highcharts.getOptions().colors[4]
                }
            },
            opposite: true
        }, {
            labels: {
                format: '{value} kPa',
                style: {
                    color: Highcharts.getOptions().colors[5]
                }
            },
            title: {
                text: 'Vapour-Pressure Deficit(VPD)',
                style: {
                    color: Highcharts.getOptions().colors[5]
                }
            },
            opposite: true
        }],
        tooltip: {
            valueDecimals: 2,
            shared: true
        },
        series: [{
            name: 'Temperature',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: datas[0],
            tooltip: {
                valueSuffix: ' °C'
            }

        }, {
            name: 'Humidity',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: datas[1],
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: 'Dew Point',
            type: 'area',
            color: Highcharts.getOptions().colors[3],
            fillOpacity: 0,
            yAxis: 2,
            data: datas[2],
            tooltip: {
                valueSuffix: ' °C'
            }
        }, {
            name: 'Humidity Deficit(HD)',
            type: 'area',
            color: Highcharts.getOptions().colors[4],
            fillOpacity: 0,
            yAxis: 3,
            data: datas[3],
            tooltip: {
                valueSuffix: ' g/m³'
            }
        }, {
            name: 'Vapour-Pressure Deficit(VPD)',
            type: 'area',
            color: Highcharts.getOptions().colors[5],
            fillOpacity: 0,
            yAxis: 4,
            data: datas[4],
            tooltip: {
                valueSuffix: ' kPa'
            }
        }]
    });

}

function drawVPDHD(vpdDatas, hdDatas) {
    //적정 VPD : 0.5 ~ 1.2 kpa
    //적정 HD : 3 ~ 8 g/m^3
    var guideVpdData = new Array;
    var guideHdData = new Array;
    for (var i = 0; i < vpdDatas.length; i++) {
        guideVpdData[i] = [vpdDatas[i][0], 0.5, 1.2];
    }
    for (var i = 0; i < hdDatas.length; i++) {
        guideHdData[i] = [hdDatas[i][0], 3, 8];
    }

    Highcharts.chart('graphVpd', {
        chart: {
            zoomType: 'x',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: ''
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            type: 'datetime'
        },

        yAxis: {
            title: {
                text: 'VPD'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            },
            itemHiddenStyle: {
                color: '#888'
            }
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueDecimals: 2,
            valueSuffix: 'kPa'
        },

        plotOptions: {
            series: {
                pointStart: 2010
            }
        },

        series: [
          {
            name: 'VPD',
            data: vpdDatas,
            color: Highcharts.getOptions().colors[5]
          }, {
              name: 'Ideal VPD',
              data: guideVpdData,
              type: 'arearange',
              lineWidth: 0,
              linkedTo: ':previous',
              color: '#ecee37',
              fillOpacity: 0.3,
              zIndex: 0,
              marker: {
                  enabled: true
              }
          }
        ]
    });

    Highcharts.chart('graphHd', {
        chart: {
            zoomType: 'x',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: ''
        },

        subtitle: {
            text: ''
        },

        xAxis: {
            type: 'datetime'
        },

        yAxis: {
            title: {
                text: 'HD'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        legend: {
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            },
            itemHiddenStyle: {
                color: '#888'
            }
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueDecimals: 2,
            valueSuffix: 'g/m³'
        },

        plotOptions: {
            series: {
                pointStart: 2010
            }
        },

        series: [{
            name: 'HD',
            data: hdDatas,
            color: Highcharts.getOptions().colors[4]
        }, {
            name: 'Ideal HD',
            data: guideHdData,
            type: 'arearange',
            lineWidth: 0,
            linkedTo: ':previous',
            color: '#ecee37',
            fillOpacity: 0.3,
            zIndex: 0,
            marker: {
                enabled: true
            }
        }]
    });
}


function drawPieChart(vpdDatas, hdDatas) {
    var high = 0;
    var right = 0;
    var low = 0;

    for (var i = 0; i < vpdDatas.length; i++) {
        if(vpdDatas[i][1] > 1.2) high++;
        else if(vpdDatas[i][1] < 0.5) low++
        else right++;
    }

    Highcharts.chart('vpdPieChart', {
        chart: {
            backgroundColor: 'rgba(0,0,0,0)',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'VPD',
            style: {
                fontWeight: 'bold',
                color: 'white'
            },
            y : 40
        },
        legend: {
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                    // enabled: true,
                    // distance: -50,
                    // style: {
                    //     fontWeight: 'bold',
                    //     color: 'white'
                    // }
                },
                 showInLegend: true
            }
        },
        series: [{
            name: ' ',
            colorByPoint: true,
            data: [{
                name: 'Low',
                y: low,
                color: '#86b9ff'
            }, {
                name: 'Ideal',
                y: right,
                color: '#006bff'
            }, {
                name: 'High',
                y: high,
                color: '#0044a1'
            }]
        }]
    });

    high = 0;
    right = 0;
    low = 0;

    for (var i = 0; i < hdDatas.length; i++) {
        if(hdDatas[i][1] > 8) high++;
        else if(hdDatas[i][1] < 3) low++
        else right++;
    }

    Highcharts.chart('hdPieChart', {
        chart: {
            backgroundColor: 'rgba(0,0,0,0)',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'HD',
            style: {
                fontWeight: 'bold',
                color: 'white'
            },
            y : 40
        },
        legend: {
            itemStyle: {
                color: '#FFF',
                fontWeight: 'bold'
            }
        },
        exporting: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                    // enabled: true,
                    // distance: -50,
                    // style: {
                    //     fontWeight: 'bold',
                    //     color: 'white'
                    // }
                },
                 showInLegend: true
            }
        },
        series: [{
            name: ' ',
            colorByPoint: true,
            data: [{
                name: 'Low',
                y: low,
                color: '#86b9ff'
            }, {
                name: 'Ideal',
                y: right,
                color: '#006bff'
            }, {
                name: 'High',
                y: high,
                color: '#0044a1'
            }]
        }]
    });
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
//var initValue = Highcharts.charts.length - 7; //그래프의 수가 6개가 넘어가면 영농일지 날씨 그래프가 껴있음(이걸 제외)
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
            shortMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
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
    if (confirm('Are you sure you want to unactivate this sensor ' + serial + '?')) {
        $.ajax({
            url: sensorServerIP + ":" + sensorServerPort + "/map/delete/" + serial + "/" + getCookie(cookie_usercode),
            type: "GET",
            dataType: "jsonp",
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
            content: "<div style='font-size:1em;color:#000;text-align:center;'><p>New Sensor Activation</p>" +
                "<div style='text-align:right;'>" +
                "Title : <input type='text' id='addName'/> <br>" +
                "Micro-Climate Sensor : <input type='text' id='addSerial'/> <br>" +
                "Soil Moisture Sensor : <input type='text' id='addSerialWeight'/> <br>" +
                "Latitude  : <input type='text' id='addLat' value='" + event.latLng.lat() + "' readonly/> <br>" +
                "Longitude : <input type='text' id='addLng' value='" + event.latLng.lng() + "' readonly/> <br>" +
                "</div>"  +
                "<input type='button' id='' onclick='addDevice()' style='margin-top:1em;' value='Submit'/> <br>" +
                "</div>",
            maxWidth: 300
        });
        addwindow.open(this, marker);
        $('#addName').focus();
        prev_addwindow = addwindow;
        prev_addmarker = marker;

        google.maps.event.addListener(marker, 'click', function() {
            prev_addwindow.open(this, prev_addmarker);
        });
    });
}

function addDevice() {
    var name = $('#addName').val();
    var serial = $('#addSerial').val();
    var serialWeight = $('#addSerialWeight').val();
    var lat = $('#addLat').val();
    var lng = $('#addLng').val();

    if (name == "") {
        alert("Please fill in the title.");
        $('#addName').focus();
    } else if (serial == "" && serialWeight == "") {
        alert("The serial number of one of the sensors must be entered.");
        $('#addSerial').focus();
    } else {
        var validCheck = 0;

        if (serial == "") serial = "-";
        else validCheck++;

        if (serialWeight == "") serialWeight = "-";
        else validCheck++;

        $.ajax({
            url: myServerIP + ":" + sensorServerPort + "/sensor/" + serial,
            type: "GET",
            dataType: "jsonp",
            success: function(response) {
                validCheck--;
            },
            error: function(response, status, error) {
                alert("The Micro-Climate Sensor serial number is not valid.");
                $('#addSerial').focus();
            }
        });
        $.ajax({
            url: myServerIP + ":" + sensorServerWeightPort + "/scale/" + serialWeight,
            type: "GET",
            dataType: "jsonp",
            success: function(response) {
                validCheck--;
            },
            error: function(response, status, error) {
                alert("The Soil Moisture Sensor serial number is not valid.");
                $('#addSerial').focus();
            }
        });

        setTimeout(function() {
            if(validCheck != 0) alert("The serial number is not valid.");
            else {
                $.ajax({
                    url: myServerIP + ":" + sensorServerPort + "/map/sensor/" + serial + "/" + serialWeight + "/" + getCookie(cookie_usercode),
                    type: "POST",
                    dataType: "json",
                    data: {
                        "title": name,
                        "lat": lat,
                        "lng": lng
                    },
                    success: function(response) {},
                    error: function(response, status, error) {}
                });

                setTimeout(function() {
                    alert("[" + name + "] Sensor Activation is completed.");
                    popupClose();
                    if (document.location.href.indexOf("weight") != -1) createMapWeight();
                    else createMap();

                    //탭확인
                    if (serial != "-") {
                        if ($("#tab-sensor").css("display") == "none") {
                            $("#tab-sensor").css("display", "block");
                            $("#tab-journal").css("display", "block");
                        }
                    }
                    if (serialWeight != "-") {
                        if ($("#tab-weight").css("display") == "none") {
                            $("#tab-weight").css("display", "block");
                        }
                    }
                }, 300);
            }
        }, 500);
    }
}

function popupClose() {
    $('#popup').fadeOut();
    $('#mask').fadeOut();
    $('#addDeviceMask').fadeOut();
}

//onclick 겹치지 않게 처리해주는 함수
function voidFunction() {}
