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
    $("#graphAll").html("");
    $('#changeGraph').html('');

    var selectedDay = 0;
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
    //("#weightDataDown").attr("href", "http://221.159.48.9:3232/export/excel/weight/" + selectedSensor + "/" + currentDate);
}
//============================================================================================
//배지 센서(저울) 지도 생성 (마커랑 common 거랑 비슷하게 해서 다해줘야함)

function createMapWeight() {
    $('#googleMapWeight').html("");

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

    map = new google.maps.Map(document.getElementById('googleMapWeight'), mapOptions);

    var url = myServerIP + ":" + sensorServerPort + "/map/sensor/";
    var usercode = getCookie(cookie_usercode);

    $.ajax({
        dataType: "jsonp",
        url: url + usercode,
        type: "GET",
        success: function(response) {

            for (i = 0; i < response.length; i++) {
                if (getCookie(cookie_recentWeight) == "") {
                    if (response[i].weight_serial != "-") {
                        latlng = new google.maps.LatLng(parseFloat(response[i].lat), parseFloat(response[i].lng));
                        break;
                    }
                } else {
                    if (response[i].weight_serial == getCookie(cookie_recentWeight)) {
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
                if (response[i].weight_serial != "-") {
                    latlng = new google.maps.LatLng(parseFloat(response[i].lat), parseFloat(response[i].lng));

                    var serial = response[i].weight_serial;
                    var title = response[i].title;

                    markers[i] = new google.maps.Marker({
                        position: latlng,
                        map: map,
                        title: title + " [" + serial + "]"
                    });

                    markerListenerWeight(map, markers[i], title, serial);

                    if (getCookie(cookie_recentWeight) == serial) { //최근에 선택한 센서이면

                        var infowindow = new google.maps.InfoWindow({
                            content: "<div style='font-size:1.3em;color:#000;'>" +
                                "Title  : <b>" + title + "</b><br/>" +
                                "Serial : <b>" + serial + "</b></div>" +
                                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\");'>delete</a>" +
                                "</div>",
                            maxWidth: 300
                        });

                        $("#notifySelect").hide();
                        prev_infowindow = infowindow;
                        infowindow.open(map, markers[i]);

                        map.setCenter(markers[i].getPosition());
                        selectedSensor = serial;
                        selectedWeightPosition = Number(response[i].lat).toFixed(5) + ',' + Number(response[i].lng).toFixed(5);
                        setDatas();
                    }
                }
            }

            $("#sensorMap").css("height", "100%");
            $("sensorDiv").css("weight", "70%");
            $(".gm-style-iw").next("div").hide();
        },
        error: function(response, status, error) {
            console.log("Failure : " + status + ", " + error);
        }
    });
}

var prev_infowindow = false;

function markerListenerWeight(map, marker, title, serial) {
    google.maps.event.addListener(marker, 'click', function() {
        setCookie(cookie_recentWeight, serial, 30);
        //센서 선택 요청 툴팁 지우기
        //$("#notifySelect").hide();

        var position = marker.position + "";
        var lat = (position.split('(')[1]).split(',')[0].trim();
        var lng = (position.split(')')[0]).split(',')[1].trim();
        position = lat + ',' + lng;
        selectedWeightPosition = position;
        setDatas(selectedDate);

        if (prev_infowindow) prev_infowindow.close();

        var infowindow = new google.maps.InfoWindow({
            content: "<div style='font-size:1.3em;color:#000;'>" +
                "Title  : <b>" + title + "</b><br/>" +
                "Serial : <b>" + serial + "</b></div>" +
                "<div style='text-align:center;color:#000;margin-top:0.5em;'>" +
                "<a style='margin-right:5px;' onclick='deleteDevice(\"" + serial + "\")'>delete</a>" +
                "</div>",
            maxWidth: 300
        });

        prev_infowindow = infowindow;
        infowindow.open(map, marker);
    });
}

//============================================================================================
//현재값 갱신(1초에 한번)
var preSerial = "";
var setCurrentWeightFirst = true;

function setCurrentWeight() {
    if (preSerial != getCookie(cookie_recentWeight) && !setCurrentWeightFirst) {
        setCurrentWeightFirst = true;
        return;
    }

    var dataQuery = "weight/recent/" + getCookie(cookie_recentWeight);
    preSerial = getCookie(cookie_recentWeight);
    setCurrentWeightFirst = false;

    $.ajax({
        dataType: "jsonp",
        url: myServerIP + ":" + sensorServerWeightPort + "/" + dataQuery,
        type: "GET",
        success: function(response) {
            var value = (response.value / 1000).toFixed(2) + "";
            if (value.length == 2) value += ".00";
            $('#currentWeight').html(value + "kg");

            if (response.liquid != null && response.liquid != undefined) {
                var liquid = (response.liquid / 1000).toFixed(2) + "";
                if (liquid.length == 2) value += ".00";
                if (liquid.length == 4) value += "0";
                $('#currentLiquid').html(liquid + "kg");
            } else {
                $('#currentLiquid').html("ㅡ");
            }
        },
        error: function(response, status, error) {
            alert("sensor value loading failure : " + status + ", " + error);
        }
    });

    setTimeout("setCurrentWeight()", 1000);
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
    calendar += '			<th class="day sun" scope="row">SUN</th>';
    calendar += '			<th class="day mon" scope="row">MON</th>';
    calendar += '			<th class="day tue" scope="row">TUE</th>';
    calendar += '			<th class="day wed" scope="row">WED</th>';
    calendar += '			<th class="day thu" scope="row">THU</th>';
    calendar += '			<th class="day fri" scope="row">FRI</th>';
    calendar += '			<th class="day sat" scope="row">SAT</th>';
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
    $.simpleWeather({
        location: selectedWeightPosition,
        woeid: '',
        unit: 'c',
        success: function(weather) {

            //오늘 날씨 갱신
            $("#weatherImage_0").html('<img style="width:auto;height:7em;display:block;margin-left:auto;margin-right:auto;" src="' +
                getImageSrc(weather.code) + '" title="' + getWeatherText(weather.code) + '" />');
            $("#temperature_0").html(weather.temp + '&deg;' + weather.units.temp + '　' + weather.humidity + '%');
            $("#temperatureHL_0").html('↑' + weather.high + '℃ ↓' + weather.low + '℃');
            $("#wind_0").html(weather.wind.direction + ' ' + weather.wind.speed + ' ' + weather.units.speed);

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

/* 영어 버전에서는 필요 없음. */
//영어(WS)로 오는 바람 방향을 한글(서남)로 번역
// function translateWindDirection(dir) {
//     var result = "";
//     for (i = 0; i < dir.length; i++) {
//         var c = dir.charAt(i);

//         switch (c) {
//             case 'E':
//                 result += "동";
//                 break;
//             case 'W':
//                 result += "서";
//                 break;
//             case 'N':
//                 result += "북";
//                 break;
//             case 'S':
//                 result += "남";
//                 break;
//         }
//     }

//     return result;
// }

//코드에 해당하는 별도로 만든 이미지의 경로 불러오기
function getImageSrc(code) {
    return '../img/weather/' + code + '.png';
}

//코드에 해당하는 기후 텍스트 반환
var arrWeatherText = new Array('폭풍', '열대성 폭풍', '허리케인', '심한 뇌우', '뇌우', '비/눈', '비/진눈깨비', '눈/진눈깨비', '결빙성 이슬비(진눈깨비)', '이슬비',
    '어는비', '소나기', '소나기', '약간의 눈', '가벼운 소나기성 눈', '불어 오는 눈*', '눈', '우박', '진눈깨비', '먼지', '안개', '실안개',
    '안개(자욱한)', '거센 바람', '많은 바람', '추움', '흐림', '흐림', '흐림', '부분적으로 흐림', '부분적으로 흐림', '맑음', '맑음', '좋음',
    '좋음', '비/우박', '더움', '국지성 뇌우', '산발성 뇌우', '산발성 뇌우', '산발성 소나기', '폭설', '산발성 소나기눈', '폭설',
    '부분적으로 흐림', '뇌우', '소나기성 눈', '국지성 뇌우');

function getWeatherText(code) {
    if (code < 0 || code >= arrWeatherText.length) return 'Can not be used';
    else return arrWeatherText[code];
}

//============================================================================================
//그래프 세팅

function setWeightGraph(date) {
    var serial = getCookie(cookie_recentWeight);
    var usercode = getCookie(cookie_usercode);
    //var date = "2017-02-24"
    var graphDataQuery = "weight/list/" + serial + "/" + date + "/one";

    var datas = new Array();
    var lightDatas = new Array();
    var supDatas = new Array();
    var useDatas = new Array(); //하루동안 증가하는 것만 보여줌
    var liquidDatas = new Array(); //배액통 실제 무게

    var year = Number(date.split('-')[0]);
    var month = Number(date.split('-')[1]);
    var day = Number(date.split('-')[2]);

    var preValue = 0;
    var supValue = 0; //최종적으로 총 공급량
    var useValue = 0; //최종적으로 총 배액양
    var preliquid = 0;

    var checkErrorIncValue = 0.10;
    var checkErrorDecValue = 0.10;

    var current = -1;
    var prev = -1;

    $.ajax({
        dataType: "jsonp",
        url: myServerIP + ":" + sensorServerWeightPort + "/" + graphDataQuery,
        type: "GET",
        success: function(response) {
            var currentSensorIndex = 0;
            var index = 0;
            var items = response;

            var test = false;

            var isRapidDecrease = false;
            var isRapidIncrease = false;
            var maxliquid = 0;

            var isIncreasing = false;
            var minWeight = 0;
            var currWeight = 0;
            var preWeight = 0;
            var diffWeight = 0;
            var count = 0;
            var supplyIndex = 0;
            var nutrientSupplyTime = '<tr>';

            var maxWeight = 0;
            var nutrientSupplyAmount = 0;
            var isWeightSensorError = false;

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

            for (i = items.length - 1; i >= 0; i--) {
                var item = items[i];

                var hour = Number(item.update_time.split(':')[0]);
                var min = Number(item.update_time.split(':')[1]);
                var sec = Number(item.update_time.split(':')[2]);
                var value = Number(item.value) / 1000;
                var liquid = Number(item.liquid) / 1000;

                datas[index] = [Date.UTC(year, month - 1, day, hour, min, sec), value];
                liquidDatas[index] = [Date.UTC(year, month - 1, day, hour, min, sec), liquid];


                if (index == 0) {
                    maxliquid = liquid;
                    preWeight = value;
                }
                if (index != 0) {
                    //급액량
                    if (preValue < value) supValue += value - preValue;

                    //배액량
                    if(isRapidDecrease) {
                        if(isRapidIncrease) {
                            isRapidDecrease = false;
                            isRapidIncrease = false;
                        }
                        if(!isRapidIncrease) {
                            maxliquid = liquid;
                            isRapidDecrease = false;
                        }
                    }

                    if(preliquid - liquid > 0.5)   isRapidDecrease = true;
                    if(liquid - preliquid > 0.5)   isRapidIncrease = true;

                    if (preliquid - liquid > 0.16) {
                        isRapidDecrease = true;
                    } else if (isRapidDecrease && liquid - preliquid < 0.16) {  //급감 후 유지 : 비움
                        maxliquid = liquid;
                        isRapidDecrease = false;
                    } else isRapidDecrease = false;    // 급감후 급상승 : 무시

                    if (maxliquid < liquid ) {
                        useValue += liquid - maxliquid;
                        maxliquid = liquid;
                    }

                    // 급액 횟수&시간 구하기
                    currWeight = value;
                    if( isWeightSensorError ) { isWeightSensorError = false; }
                    else if( isIncreasing && currWeight - preWeight < 0 ) {
                       diffWeight = currWeight - minWeight;
                        maxWeight = preWeight;
                       if( diffWeight > 0.2 ) {   // 증가량이 200g 이상이면 급액한 것으로 간주
                            var da = new Date(datas[supplyIndex][0]);
                            nutrientSupplyAmount = parseInt((maxWeight - minWeight) * 1000);
                            nutrientSupplyTime += '<td>' + convertKoraTime(da) +' ('+ nutrientSupplyAmount +'ml)'+ '</td>';
                            count++;
                            if(count % 3 == 0) nutrientSupplyTime += '</tr> <tr>';
                       }
                      isIncreasing = false;
                    }
                    else if( !isIncreasing && currWeight - preWeight > 0.02 ) {
                        isIncreasing = true;
                        minWeight = preWeight;
                        supplyIndex = index-1;
                    }

                    if( preWeight - currWeight > 0.2) { isWeightSensorError = true; }
                    preWeight = currWeight;
                }

                //liquid 값으로 변경해야함 현재 null 이라 사용 x
                useDatas[index] = [Date.UTC(year, month - 1, day, hour, min, sec), useValue];

                preliquid = liquid;
                preValue = value;
                index++;
            }
            nutrientSupplyTime  += '</tr>';

            // for (i = 0; i < datas.length; i++) {
            //     if (current == -1) {
            //         current = datas[i][1];
            //         prev = datas[i][1];
            //     }
            // }

            //총 공급량 배액량 세팅
            $("#supply_number").html(count + " times");
            $("#supply_time").html(nutrientSupplyTime);
            $("#supply").html(supValue.toFixed(2) + "kg");
            $("#use").html(useValue.toFixed(2) + "kg");
            $("#plantWeight").html("(To be implemented)");
            $("#eva").html("(To be implemented)");


            //연결되어 있는 센서 시리얼 획득 후(success 안) 광센서 값 가져오기
            $.ajax({
                dataType: "jsonp",
                url: myServerIP + ":" + sensorServerPort + "/map/sensor/" + serial + "/" + usercode,
                type: "GET",
                success: function(response2) {
                    //연결되어있는 광량 데이터 가져오기
                    var sensorSeiral = response2[0].serial;

                    if (sensorSeiral != "-") {
                        graphDataQuery = "list/light/" + sensorSeiral + "/" + date + "/one";

                        $.ajax({
                            dataType: "jsonp",
                            url: myServerIP + ":" + myServerPort + "/" + graphDataQuery,
                            type: "GET",
                            success: function(response3) {
                                var index = 0;
                                for (i = 0; i < response3.graphItems.length; i++) {
                                    var item = response3.graphItems[i];

                                    var hour = Number(item.update_time.split(':')[0]);
                                    var min = Number(item.update_time.split(':')[1]);
                                    var value = Number(item.light)*2.7;

                                    lightDatas[i] = [Date.UTC(year, month - 1, day, hour, min, 0), value];
                                }
                                drawWeightGraph(datas, useDatas, kalman(lightDatas));
                                drawWeightEachGraph(datas, useDatas, liquidDatas);
                            },
                            error: function(response2, status, error) {}
                        });
                    } else {
                        drawWeightGraph(datas, useDatas, kalman(lightDatas));
                        drawWeightEachGraph(datas, useDatas, liquidDatas);
                    }
                },
                error: function(response2, status, error) {

                }
            });
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
                text: 'Illumination',
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
                text: 'Channel Weight',
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
                text: 'Amount of Drainage',
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
            name: 'Illumination',
            type: 'area',
            color: Highcharts.getOptions().colors[2],
            fillOpacity: 0,
            yAxis: 0,
            data: lightDatas,
            tooltip: {
                valueSuffix: ' ㏓'
            }

        }, {
            name: 'Channel Weight',
            type: 'area',
            color: Highcharts.getOptions().colors[0],
            fillOpacity: 0,
            yAxis: 1,
            data: data,
            tooltip: {
                valueSuffix: ' kg'
            }

        }, {
            name: 'Amount of Drainage',
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

function drawWeightEachGraph(datas, useDatas, liquidDatas) {

    var datasList = new Array();
    datasList[0] = datas;
    datasList[1] = useDatas;
    datasList[2] = liquidDatas;

    for (i = 0; i < 3; i++) {

        var title;
        var valueSuffix = " ";
        switch (i) {
            case 0:
                valueSuffix += "kg";
                title = "Channel Weight";
                break;
            case 1:
                valueSuffix += "kg";
                title = "Amount of Drainage";
                break;
            case 2:
                valueSuffix += "kg";
                title = "Scale";
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
        alert("Invalid Date! Please Set Valid Date.");
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
