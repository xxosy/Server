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
    
    var recentValueQuery = "value/recent/serial/" + selectedSensor;
    $.ajax({
        dataType: "json",
        url: myServerIP + ":" + sensorServerPort + "/" + recentValueQuery,
        type: "GET",
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
//============================================================================================
//그래프 세팅
//그래프 들어갈 div 아이디 : graph
function setGraph(selectedSensor, date) {
    var year = Number(date.split('-')[0]);
    var month = Number(date.split('-')[1]);
    var day = Number(date.split('-')[2]);

    var datas = new Array(); //0~5 위에 순서대로
    var flgGraphData = 0;

    var graphDataQuery = "value/list/all/" + selectedSensor + "/" + date;

    $.ajax({
        dataType: "json",
        url: myServerIP + ":3000/" + graphDataQuery, //[TBD]추후 baseURL 로 교체해야함 (현재 복호화때문에 별도 서버 우회중, 교체 후 값사용 시 복호화 해서 사용해야함)
        type: "GET",
        success: function(response) {
            var currentSensorIndex = 0;
            if(response.statecode === 200){
                for(var k = 0;k<7;k++){
                    datas[k] = new Array();
                }
                for (j = 0; j < response.data.length; j++) {
                    var item = response.data[j];

                    var hour = Number(item.update_time.split(':')[0]);
                    var min = Number(item.update_time.split(':')[1]);
                    var value = JSON.parse(response.data[j].data.value);

                    datas[0][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.temperature)];
                    datas[1][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.humidity)];
                    datas[2][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.light)];
                    datas[3][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.co2)];
                    datas[4][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.ph)];
                    datas[5][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.ec)];
                    datas[6][j] = [Date.UTC(year, month - 1, day, hour, min, 0), Number(value.temperature_ds)];            
                }

                //칼만 사용하면 위에꺼 안하면 아래꺼 사용
                for(var k = 0;k<7;k++){
                    if (response.data.length > 0) datas[k] = kalman(datas[k]);
                }
                //if (response.graphItems.length > 0) datas[currentSensorIndex] = datas[currentSensorIndex];
                var humidityDatas = new Array();

                humidityDatas[0] = datas[0];
                humidityDatas[1] = datas[1];
                humidityDatas[2] = new Array(); //이슬점
                humidityDatas[3] = new Array(); //HD
                humidityDatas[4] = new Array(); //VPD

                if (response.data.length > 0) {
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

//ajax 통신의 success 콜백 발생시간의 시간차때문에 모든 데이터 수신후 아래 함수 호출하여 전체 그래프 생성
//var flgReRequest = false; //수신데이터가 부족할경우 한번더 요청해보도록
var isFirstDraw = true; //처음 그릴때 싱크로나이즈드 그래프 마우스 이벤트 등록 여부 관련 플래그
function drawGraph(datas) {
    $('#graph').html('');

    for (i = 0; i < 7; i++) {

        var title = "";
        var valueSuffix = " ";
        switch (i) {
            case 0:
                valueSuffix += "℃";
                title = "온도";
                break;
            case 1:
                valueSuffix += "%";
                title = "습도";
                break;
            case 2:
                valueSuffix += "㏓";
                title = "광량";
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
                title = "지온";
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
                text: '온도',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, {
            title: {
                text: '습도',
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
                text: '광량',
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
                text: '지온',
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
            name: '온도',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: datas[0],
            tooltip: {
                valueSuffix: ' °C'
            }

        }, {
            name: '습도',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: datas[1],
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: '광량',
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
            name: '지온',
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
                text: '온도',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, {
            title: {
                text: '습도',
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
                text: '이슬점',
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
                text: 'HD',
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
                text: 'VPD',
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
            name: '온도',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: datas[0],
            tooltip: {
                valueSuffix: ' °C'
            }

        }, {
            name: '습도',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: datas[1],
            tooltip: {
                valueSuffix: ' %'
            }

        }, {
            name: '이슬점',
            type: 'area',
            color: Highcharts.getOptions().colors[3],
            fillOpacity: 0,
            yAxis: 2,
            data: datas[2],
            tooltip: {
                valueSuffix: ' °C'
            }
        }, {
            name: 'HD',
            type: 'area',
            color: Highcharts.getOptions().colors[4],
            fillOpacity: 0,
            yAxis: 3,
            data: datas[3],
            tooltip: {
                valueSuffix: ' g/m³'
            }
        }, {
            name: 'VPD',
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

// VPD & HD Line차트로 그리기
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
            color: Highcharts.getOptions().colors[5],
            zIndex: 1
          }, {
              name: '최적 VPD',
              data: guideVpdData,
              type: 'arearange',
              lineWidth: 1.2,
              linkedTo: ':previous',
              color: '#f7f700',
              fillOpacity: 0.3,
              zIndex: 0
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
            color: Highcharts.getOptions().colors[4],
            zIndex: 1
        }, {
            name: '최적 HD',
            data: guideHdData,
            type: 'arearange',
            lineWidth: 1.2,
            linkedTo: ':previous',
            color: '#f7f700',
            fillOpacity: 0.3,
            zIndex: 0
        }]
    });
}

// VPD & HD Pie차트로 그리기
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
                name: '낮음',
                y: low,
                color: '#86b9ff'
            }, {
                name: '적정',
                y: right,
                color: '#006bff'
            }, {
                name: '높음',
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
                name: '낮음',
                y: low,
                color: '#86b9ff'
            }, {
                name: '적정',
                y: right,
                color: '#006bff'
            }, {
                name: '높음',
                y: high,
                color: '#0044a1'
            }]
        }]
    });
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
