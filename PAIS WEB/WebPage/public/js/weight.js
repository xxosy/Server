//============================================================================================
//각종 데이터 세팅

var preSelectedYear = -1;
var preSelectedMonth = -1;
var preSelectedDay = -1;
var preColor;
var selectedDate;
var selectedSerial; //선택된 저울과 연결돼있는 미기후 센서 (없을 수도 있음 없을땐 "" 값)
var selectedWeightPosition;

var selectedColor = "rgba(255,255,255,0.3)";

function setDatas(date) {
    clearTimeout(roop_weight)
    $("#graphAll").html("");
    $('#changeGraph').html('');

    var selectedDay = 0;1
    var selectedYear = Number($('#date').html().split('-')[0]);
    var selectedMonth = Number($('#date').html().split('-')[1]);

    if (date == null) selectedDate = new Date().getDate();
    else selectedDate = date;

    selectedDay = $('#' + selectedDate);
    currentDate = $('#date').html() + '-';

    if (date < 10) currentDate += '0' + selectedDate;
    else currentDate += selectedDate;

    //선택한 날짜가 변경되었을 경우 해당 날짜 표시
    if (preSelectedMonth != selectedMonth || preSelectedDay != selectedDate || preSelectedYear != selectedYear) {


        if (preSelectedDay != -1) { //처음 선택한것이 아닐경우
            $('#' + preSelectedDay).css("background-color", preColor);
        }

        preColor = selectedDay.css("background-color");
        preSelectedDay = selectedDate;
        preSelectedMonth = selectedMonth;
        preSelectedYear = selectedYear;
        selectedDay.css("background-color", selectedColor);

        //  $("#selectedDate").html(currentDate + " 일지");
    }

    //날씨 세팅
    setWeather();

    //현재 무게값(배지무게, 배액무게) 세팅
    setCurrentWeight();

    //그래프 그리기
    setWeightGraph(currentDate);

    //데이터 다운로드 링크 연결
    $("#weightDataDown").attr("href", "http://221.159.48.9:3232/export/excel/weight/" + selectedSensor + "/" + currentDate);

    // 언어 설정
    setLanguage(getCookie("language"));
}
//============================================================================================
//배지 센서(저울) 지도 생성 (마커랑 common 거랑 비슷하게 해서 다해줘야함)

var prev_infowindow = false;

//============================================================================================
//현재값 갱신(1초에 한번)
var preSerial = "";
var setCurrentWeightFirst = true;
var roop_weight;
function setCurrentWeight() {
    if (preSerial != getCookie(cookie_recentSensor) && !setCurrentWeightFirst) {
        setCurrentWeightFirst = true;
        return;
    }
    var query = getCookie(cookie_recentSensor);
    var signature = createhmac(query);
    var dataQuery = "value/recent/serial/" + query;
    preSerial = getCookie(cookie_recentSensor);
    setCurrentWeightFirst = false;
    $.ajax({
        dataType: "json",
        url: myServerIP + ":" + sensorServerPort + "/" + dataQuery,
        type: "GET",
        headers:{"X-Signature":signature},
        success: function(response) {
            if(response.status !== "fail"){
                var medium_weight = (response.data.medium_weight / 1000).toFixed(2) + "";
                if (medium_weight.length == 2) medium_weight += ".00";
                $('#currentWeight').html(medium_weight + "kg");

                if (response.data.drain_weight != null && response.data.drain_weight != undefined) {
                    var drain_weight = (response.data.drain_weight / 1000).toFixed(2) + "";
                    if (drain_weight.length == 2) medium_weight += ".00";
                    if (drain_weight.length == 4) medium_weight += "0";
                    $('#currentLiquid').html(drain_weight + "kg");
                } else {
                    $('#currentLiquid').html("ㅡ");
                }
            }else{

            }
        },
        error: function(response, status, error) {
            alert("sensor value loading failure : " + status + ", " + error);
        }
    });

    roop_weight = setTimeout("setCurrentWeight()", 60000);
}

//============================================================================================
//달력 세팅
function drawCalendar(date) {

    if (typeof(date) !== 'undefined') {
        date = date.split('-');
        date[1] = date[1] - 1;
        date = new Date(date[0], date[1], date[2]);
    } else {
        var date = new Date();
    }
    var currentYear = date.getFullYear();
    //년도를 구함

    var currentMonth = date.getMonth() + 1;
    //연을 구함. 월은 0부터 시작하므로 +1, 12월은 11을 출력

    var currentDate = date.getDate();
    //오늘 일자.

    if (currentMonth == new Date().getMonth() + 1) {
        currentDate = new Date().getDate();
    }

    date.setDate(1);
    var currentDay = date.getDay();
    //이번달 1일의 요일은 출력. 0은 일요일 6은 토요일

    var dateString = new Array('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
    var lastDate = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
    if ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0)
        lastDate[1] = 29;
    //각 달의 마지막 일을 계산, 윤년의 경우 년도가 4의 배수이고 100의 배수가 아닐 때 혹은 400의 배수일 때 2월달이 29일 임.

    var currentLastDate = lastDate[currentMonth - 1];
    var week = Math.ceil((currentDay + currentLastDate) / 7);
    //총 몇 주인지 구함.

    if (currentMonth != 1)
        var prevDate = currentYear + '-' + (currentMonth - 1) + '-' + currentDate;
    else
        var prevDate = (currentYear - 1) + '-' + 12 + '-' + currentDate;
    //만약 이번달이 1월이라면 1년 전 12월로 출력.

    if (currentMonth != 12)
        var nextDate = currentYear + '-' + (currentMonth + 1) + '-' + currentDate;
    else
        var nextDate = (currentYear + 1) + '-' + 1 + '-' + currentDate;
    //만약 이번달이 12월이라면 1년 후 1월로 출력.

    var prevYear = (currentYear - 1) + '-' + (currentMonth) + '-' + currentDate;
    var nextYear = (currentYear + 1) + '-' + (currentMonth) + '-' + currentDate;

    if (currentMonth < 10)
        var currentMonth = '0' + currentMonth;
    //10월 이하라면 앞에 0을 붙여준다.

    var actualyDate = new Date();

    var calendar = '';

    calendar += '<div id="header" class="w3-border-bottom" style="text-align:center;margin-bottom:1em;">';
    calendar += '	<span style="text-align:right;margin-top:0.2em;font-size:1.5em;">';
    calendar += '		<a href="#" onclick="drawCalendar(\'' + prevYear + '\')"> << </a>';
    calendar += '		<a href="#" onclick="drawCalendar(\'' + prevDate + '\')"> < </a>';
    calendar += '	</span>';
    calendar += '	<span id="date" style="font-size:1.5em;">' + currentYear + '-' + currentMonth + '</span>';
    calendar += '	<span style="text-align:left;margin-top:0.2em;font-size:1.5em;">';
    calendar += '		<a href="#" onclick="drawCalendar(\'' + nextDate + '\')"> > </a>';
    calendar += '		<a href="#" onclick="drawCalendar(\'' + nextYear + '\')"> >> </a>';
    calendar += '	</span>';
    calendar += '</div>';

    calendar += '<table id="calendarTable" class="alt">';
    calendar += '	<thead>';
    calendar += '		<tr>';
    calendar += '			<th class="day sun" scope="row">일</th>';
    calendar += '			<th class="day mon" scope="row">월</th>';
    calendar += '			<th class="day tue" scope="row">화</th>';
    calendar += '			<th class="day wed" scope="row">수</th>';
    calendar += '			<th class="day thu" scope="row">목</th>';
    calendar += '			<th class="day fri" scope="row">금</th>';
    calendar += '			<th class="day sat" scope="row">토</th>';
    calendar += '		</tr>';
    calendar += '	</thead>';
    calendar += '	<tbody">';

    var dateNum = 1 - currentDay;

    var tdStyle = "padding: 1em 0em;";

    for (var i = 0; i < week; i++) {
        calendar += '			<tr>';
        for (var j = 0; j < 7; j++, dateNum++) {
            if (dateNum < 1 || dateNum > currentLastDate) {
                calendar += '				<td style="' + tdStyle + '" class="day disable ' + dateString[j] + '"></td>';
                continue;
            }

            if (currentYear > actualyDate.getFullYear())
                calendar += '				<td style="' + tdStyle + '" class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if (currentYear == actualyDate.getFullYear() && currentMonth - 1 > actualyDate.getMonth())
                calendar += '				<td style="' + tdStyle + '" class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if ((currentYear == actualyDate.getFullYear() && currentMonth - 1 < actualyDate.getMonth()) || currentYear < actualyDate.getFullYear())
                calendar += '				<td style="' + tdStyle + '" id="' + dateNum + '" onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '">' + dateNum + '</td>';
            else if (dateNum > currentDate)
                calendar += '				<td style="' + tdStyle + '" class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if (dateNum == currentDate)
                calendar += '				<td style="' + tdStyle + '" id="' + dateNum + '"  onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '"><b>' + dateNum + '</b></td>';
            else calendar += '				<td style="' + tdStyle + '" id="' + dateNum + '"  onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '">' + dateNum + '</td>';
        }
        calendar += '			</tr>';
    }

    calendar += '	</tbody>';
    calendar += '</table>';

    $('#calendar').html(calendar);

    if (preSelectedDay != -1 && currentYear == preSelectedYear && currentMonth == preSelectedMonth) {
        preColor = $('#' + preSelectedDay).css("background-color");
        $('#' + preSelectedDay).css("background-color", selectedColor);
    }
}

function changeCalender(destation) {
    if (destation == "today") drawCalendar();
    else if (destation == "selected") drawCalendar($("#selectedDate").html().split(' ')[0]);
}

//============================================================================================
//날씨 세팅
function setWeather() {
    console.log(selectedPosition);
    $.simpleWeather({
        location: selectedPosition,
        woeid: '',
        unit: 'c',
        success: function(weather) {

            //오늘 날씨 갱신
            $("#weatherImage_0").html('<img style="width:auto;height:7em;display:block;margin-left:auto;margin-right:auto;" src="' +
                getImageSrc(weather.code) + '" title="' + getWeatherText(weather.code) + '" />');
            $("#temperature_0").html(weather.temp + '&deg;' + weather.units.temp + '　' + weather.humidity + '%');
            $("#temperatureHL_0").html('↑' + weather.high + '℃ ↓' + weather.low + '℃');
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

//============================================================================================
//그래프 세팅

function setWeightGraph(date) {
    var serial = getCookie(cookie_recentSensor);
    var usercode = getCookie(cookie_usercode);

    var query = serial;
    var signature = createhmac(query);
    //var date = "2017-02-24"
    var graphDataQuery = "value/list/all/" + serial + "/" + date;

    var datas = new Array();
    var lightDatas = new Array();
    var supDatas = new Array();
    var useDatas = new Array(); //하루동안 증가하는 것만 보여줌
    var drainDatas = new Array(); //배액통 실제 무게

    var year = Number(date.split('-')[0]);
    var month = Number(date.split('-')[1]);
    var day = Number(date.split('-')[2]);

    $.ajax({
        dataType: "json",
        url: myServerIP + ":" + sensorServerPort + "/" + graphDataQuery,
        type: "GET",
        headers:{"X-Signature":signature},
        success: function(response) {
            if(response.status !== "fail"){
                var items = response.data;

                //배액 관련 변수
                var isDraining = false;
                var preDrainWeight = 0;
                var prepreDrainWeight = 0;
                var supplyCount = 0;
                var abmormalDrainIndexs = new Array();

                //급액 관련 변수
                var currWeight = 0;
                var preWeight = 0;
                var prepreWeight = 0;
                var isSupplying = false;
                var supStartTime = 0;
                var supValue = 0;
                var totalSupValue = 0;
                var supplyLogs = '<tr>';

                // 수확량 관련 변수
                var useValue = 0;
                var preUseValue = 0;
                var amountOfHarvest = 0;
                var harvestCount=0;
                var harvestTime = '<tr>';

                function convertKoraTime(date) {
                    var hours = date.getHours();
                    var minutes = date.getMinutes();
                    var time = "";

                    hours -= 9;
                    if (hours < 0) hours = 24 + hours;
                    if (hours < 10) time += "0";
                    time += hours + " : ";

                    if (minutes < 10) time += "0";
                    time += minutes;

                    return time;
                }

                for (i = 0; i <items.length; i++) {
                    var item = items[i];
                    var hour = Number(item.update_time.split(':')[0]);
                    var min = Number(item.update_time.split(':')[1]);
                    // var sec = Number(item.update_time.split(':')[2]);

                    var medium_weight = Number(item.medium_weight) / 1000;
                    var drainWeight = Number(item.drain_weight) / 1000;
                    var light = Number(item.light)*2.7;

                    datas[i] = [Date.UTC(year, month - 1, day, hour, min, 0), medium_weight];
                    drainDatas[i] = [Date.UTC(year, month - 1, day, hour, min, 0), drainWeight];
                    lightDatas[i] = [Date.UTC(year, month - 1, day, hour, min, 0), light];

                    if (i == 0) {
                        supplyCount = 0;
                        preDrainWeight = drainWeight;
                        preWeight = medium_weight;
                        prepreWeight = preWeight;
                    }

                    if (i != 0) {
                        // 배액량 계산
                        if(drainWeight > preDrainWeight) {
                            if(preDrainWeight-prepreDrainWeight < -0.2 && drainWeight-preDrainWeight > 0.2) {
                                drainDatas[i-1][1] = (drainWeight + prepreDrainWeight) / 2  // 에러데이터 그래프에서 제거
                            }
                            else if(!isDraining && drainWeight-preDrainWeight < 0.01) {} //미세하게 진동하는 값 무시
                            else {
                                isDraining = true
                                useValue += drainWeight-preDrainWeight
                            }
                        }
                        else if (drainWeight-preDrainWeight < -0.5 && preDrainWeight-prepreDrainWeight > 0.5) { // 에러 데이터 그래프에서 제거
                            let errorAmount = preDrainWeight-drainWeight
                            useValue -= errorAmount
                            drainDatas[i-1][1] -= errorAmount
                            useDatas[i-1][1] -= errorAmount
                        }
                        else if (isDraining) {
                            if(drainWeight > prepreDrainWeight) {
                                useValue += drainWeight-preDrainWeight
                                preUseValue -= (drainWeight-preDrainWeight) / 2
                                abmormalDrainIndexs.push(i - 1)
                            }
                            else {
                                isDraining = false
                                console.log(useValue)
                            }
                        }

                        // 급액 횟수&시간 구하기
                        currWeight = medium_weight;
                        if(currWeight > preWeight) {
                            if(preWeight-prepreWeight < -0.5 && currWeight-preWeight > 0.5) { // 에러 데이터 그래프에서 제거
                                datas[i-1][1] = (currWeight + prepreWeight) / 2
                            }
                            else if(!isSupplying && currWeight-preWeight < 0.01) {} //미세하게 진동하는 값 무시
                            else {
                                if(!isSupplying) {
                                    supValue = 0
                                    supStartTime = new Date(datas[i-1][0])
                                }
                                isSupplying = true
                                isFinishSupplying = false
                                supValue += currWeight-preWeight
                                if(isDraining) supValue += drainWeight-preDrainWeight
                            }
                        } else if (currWeight-preWeight < -0.2 && preWeight-prepreWeight > 0.2) { // 에러 데이터 그래프에서 제거
                            let errorAmount = preWeight-currWeight
                            supValue -= errorAmount
                            datas[i-1][1] -= errorAmount
                        } else if(isSupplying) {
                            isSupplying = false
                            if(supValue > 0.15) {
                                supplyCount++
                                totalSupValue += supValue
                                supplyLogs += '<td>' + convertKoraTime(supStartTime) +' ('+ parseInt(supValue*1000) +'ml)'+ '</td>'
                                if(supplyCount % 3 == 0) supplyLogs += '</tr> <tr>';
                            }
                        }

                        // 수확량 확인
                        var diffSoilWeight = preWeight-currWeight;  // 급액량 차이
                        var diffUseValue = useValue-preUseValue;    // 배액량 차이
                        if( (currWeight-preWeight > 0) && (preWeight-prepreWeight > 0) ) {   // 급액 도중 수확
                            if( currWeight-preWeight <= preWeight-prepreWeight-0.005) {    // 단위 급액량은 종료될 때까지 유지되거나 커짐
                            }
                        }
                        else if(diffSoilWeight-diffUseValue > 0.05 && diffSoilWeight < 0.2) {
                            var d = new Date(datas[i][0]);
                            amountOfHarvest += diffSoilWeight-diffUseValue;
                            harvestTime += '<td>' + convertKoraTime(d) +' ('+ ((diffSoilWeight-diffUseValue)*1000).toFixed(0) +'g)'+ '</td>';
                            harvestCount++;
                            if(harvestCount % 3 == 0) harvestTime += '</tr> <tr>';
                        }

                        preUseValue = useValue;

                        prepreDrainWeight = preDrainWeight;
                        preDrainWeight = drainWeight;

                        prepreWeight = preWeight;
                        preWeight = currWeight;
                    }

                    useDatas[i] = [Date.UTC(year, month - 1, day, hour, min, 0), useValue];

                    while(abmormalDrainIndexs.length != 0) {
                        var pos = abmormalDrainIndexs.pop();
                        if(pos != 1 && pos != useDatas.length-1)
                        useDatas[pos][1] = (useDatas[pos-1][1] + useDatas[pos+1][1]) / 2
                    }
                }
                datas[i] = [Date.UTC(year, month - 1, day, 23, 59, 59), null];
                drainDatas[i] = [Date.UTC(year, month - 1, day, 23, 59, 59), null];
                useDatas[i] = [Date.UTC(year, month - 1, day, 23, 59, 59), null];
                supplyLogs  += '</tr>';

                //총 공급량 배액량 세팅
                $("#supply_number").html(supplyCount + " " + $.lang[getCookie("language")]['times']);
                $("#supply_time").html(supplyLogs);
                $("#harvest_time").html(harvestTime);
                $("#supply").html(totalSupValue.toFixed(2) + "kg");
                $("#use").html(useValue.toFixed(2) + "kg");
                $("#eva").html("(" + $.lang[getCookie('language')]['unimplement'] + ")");
                $("#plantWeight").html("(" + $.lang[getCookie('language')]['unimplement'] + ")");


                //연결되어 있는 센서 시리얼 획득 후(success 안) 광센서 값 가져오기
                console.log(datas);
                console.log(useDatas);
                console.log(lightDatas);
                console.log(drainDatas);
                drawWeightGraph(datas, useDatas, kalman(lightDatas));

                drawWeightEachGraph(datas, useDatas, drainDatas, kalman(lightDatas));
            }

        },
        error: function(response, status, error) {
            alert("sensor value loading failure : " + status + ", " + error);
        }
    });

}

function drawWeightGraph(data, useDatas, lightDatas) {
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
            title: {
                text: $.lang[getCookie("language")]['light'],
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            labels: {
                format: '{value} ㏓',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true

        }, {
            title: {
                text: $.lang[getCookie("language")]['weight_channel'],
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} kg',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            }

        }, {
            title: {
                text: $.lang[getCookie("language")]['weight_drainage'],
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            },
            labels: {
                format: '{value} kg',
                style: {
                    color: Highcharts.getOptions().colors[3]
                }
            }
        }],
        tooltip: {
            valueDecimals: 2,
            shared: true
        },
        series: [{
            name: $.lang[getCookie("language")]['light'],
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: lightDatas,
            tooltip: {
                valueSuffix: ' ㏓'
            }

        }, {
            name: $.lang[getCookie("language")]['weight_channel'],
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: data,
            tooltip: {
                valueSuffix: ' kg'
            }

        }, {
            name: $.lang[getCookie("language")]['weight_drainage'],
            type: 'area',
            color: Highcharts.getOptions().colors[3],
            fillOpacity: 0,
            yAxis: 2,
            data: useDatas,
            tooltip: {
                valueSuffix: ' kg'
            }
        }]
    });
}

var isFirstDraw = true;

function drawWeightEachGraph(datas, useDatas, liquidDatas, litghtDatas) {

    var datasList = new Array();
    datasList[0] = datas;
    datasList[1] = useDatas;
    datasList[2] = liquidDatas;
    datasList[3] = litghtDatas;

    Highcharts.chart('changeGraph', {
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
            title: {
                text: '광량',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            labels: {
                format: '{value} ㏓',
                style: {
                    color: Highcharts.getOptions().colors[2]
                }
            },
            opposite: true,
            showFirstLabel: false
        }, {
            title: {
                text: '배지 무게',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} kg',
                x: 3,
                y: 13,
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true,
            showFirstLabel: false
        }],
        plotOptions: {
            area: {
                threshold: null
            }
        },
        tooltip: {
            valueDecimals: 2,
            shared: true
        },
        series: [{
            name: '광량',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: datasList[3],
            tooltip: {
                valueSuffix: ' ㏓'
            }

        }, {
            name: '배지 무게',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0.3,
            yAxis: 1,
            data: datasList[0],
            tooltip: {
                valueSuffix: ' kg'
            },
        }]
    });

    for (i = 1; i < 3; i++) {

        var title;
        var valueSuffix = " ";
        switch (i) {
            case 0:
            valueSuffix += "kg";
            title = $.lang[getCookie("language")]['weight_channel'];
            break;
            case 1:
            valueSuffix += "kg";
            title = $.lang[getCookie("language")]['weight_drainage'];
            break;
            case 2:
            valueSuffix += "kg";
            title = $.lang[getCookie("language")]['weight_scale'];
            break;
        }


        $('<div class="chart" style="margin-top:1em;">')
        .appendTo('#changeGraph')
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
                        setExtremes: syncExtremesWeight
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
                    data: datasList[i],
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
        syncEventWeight();
    }
}

////////////////////////////////////////////////////////////
//차트 싱크로나이즈드 형태로 보여주기
/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */

 function syncEventWeight() {
    var initValue = Highcharts.charts.length - 3; //그래프의 수가 6개가 넘어가면 영농일지 날씨 그래프가 껴있음(이걸 제외)
    $('#changeGraph').bind('mousemove touchmove touchstart', function(e) {
        var chart,
        point,
        i,
        event;

        for (i = Highcharts.charts.length - 3; i < Highcharts.charts.length; i++) {
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
 function syncExtremesWeight(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        for (i = Highcharts.charts.length - 3; i < Highcharts.charts.length; i++) {
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

function downloadCalPopupShow() {
    $('#downloadStartDate').val(currentDate);
    $('#downloadEndDate').val(currentDate);

    $('#downloadMask').fadeIn(1);
}

function downloadCalPopupClose() {
    $('#downloadMask').fadeOut();
}

function downloadData() {
    var startDate = $('#downloadStartDate').val();
    var endDate = $('#downloadEndDate').val();

    //sensorServerIP + ":" + sensorServerWeightPort + "/export/excel/weight/" + selectedSensor + "/" + currentDate
    var downLinkUrl = myServerIP + ":" + sensorServerWeightPort + "/export/excel/weight/";
    var downQuery;

    var downFlag = dateCompare(startDate, endDate);
    if (downFlag == 1) {
        downQuery = selectedSensor + "/" + endDate;

        downloadUrl(downLinkUrl + downQuery);
    } else if (downFlag == 2){
        var start = convertDate(startDate);
        var end = convertDate(endDate);

        var gap = ((end.getTime() - start.getTime()) / (24 * 60 * 60)) / 1000;
        for (i = 0 ; i <= gap ; i++) {
            var downDate = new Date();
            downDate.setTime(start.getTime() + ((24 * 60 * 60 ) * i * 1000));
            downQuery = selectedSensor + "/" + downDate.getUTCFullYear() + "-" + ("0" + (downDate.getUTCMonth())).slice(-2) + "-" + ("0" + (downDate.getUTCDate()+1)).slice(-2);

            downloadUrl(downLinkUrl + downQuery);
        }
    } else {
        alert("잘못된 날짜 입니다.");
        return;
    }

    downloadCalPopupClose();
    return;
}

function dateCompare(startDate, endDate) {
  var start = convertDate(startDate);
  var end = convertDate(endDate);

  if (start.getTime() > end.getTime()) return 0;
  else if (start.getTime() == end.getTime()) return 1;
  else return 2;
}

function convertDate(text) {
  return new Date(text.split('-')[0], text.split('-')[1], text.split('-')[2]);
}

function downloadUrl(url) {
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
}
