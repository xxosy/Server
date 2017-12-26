//===========================================================================
//각종 데이터 세팅

var preSelectedYear = -1;
var preSelectedMonth = -1;
var preSelectedDay = -1;
var preColor;

var selectedColor = "rgba(255,255,255,0.3)";
var selectedDate_;

function setDatas(selectedDate) {
    var selectedDay = 0;
    var selectedYear = Number($('#date').html().split('-')[0]);
    var selectedMonth = Number($('#date').html().split('-')[1]);

    if (selectedDate == null) selectedDate = Number(today.split('-')[2]);

    selectedDay = $('#' + selectedDate);
    var currentDate = $('#date').html() + '-';

    if (selectedDate < 10) currentDate += '0' + selectedDate;
    else currentDate += selectedDate;

    selectedDate_ = currentDate;

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

        $("#selectedDate").html(currentDate + " 일지");
    }

    //작업 현황, 특이사항 갱신


    //해당 날짜 날씨 갱신
    //setWeatherGraph(selectedSensor, currentDate);

    //카메라 사진들 갱신(2줄)
    setCamURL();

    //그래프 갱신
    setGraph(selectedSensor, currentDate);

    //엑셀 다운로드 링크 갱신
    //http://221.159.48.9:3000/export/excel/all/P5224/2017-06-11
    //$("#allDataDown").attr("href", "http://221.159.48.9:3000/export/excel/all/" + selectedSensor + "/" + currentDate);
    refreshJournal();

}


//============================================================================
//달력 출력
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

    for (var i = 0; i < week; i++) {
        calendar += '			<tr>';
        for (var j = 0; j < 7; j++, dateNum++) {
            if (dateNum < 1 || dateNum > currentLastDate) {
                calendar += '				<td class="day disable ' + dateString[j] + '"></td>';
                continue;
            }

            if (currentYear > actualyDate.getFullYear())
                calendar += '				<td class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if (currentYear == actualyDate.getFullYear() && currentMonth - 1 > actualyDate.getMonth())
                calendar += '				<td class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if ((currentYear == actualyDate.getFullYear() && currentMonth - 1 < actualyDate.getMonth()) || currentYear < actualyDate.getFullYear())
                calendar += '				<td id="' + dateNum + '" onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '">' + dateNum + '</td>';
            else if (dateNum > currentDate)
                calendar += '				<td class="day ' + dateString[j] + ' disable">' + dateNum + '</td>';
            else if (dateNum == currentDate)
                calendar += '				<td id="' + dateNum + '"  onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '"><b>' + dateNum + '</b></td>';
            else calendar += '				<td id="' + dateNum + '"  onClick="setDatas(' + dateNum + ')" class="aniEle day ' + dateString[j] + '">' + dateNum + '</td>';
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

// =====================================================================
// 날씨그래프 출력
var sensors = new Array();
sensors[0] = 'temperature';

function setWeatherGraph(selectedSensor, currentDate) {
    var year = Number(currentDate.split('-')[0]);
    var month = Number(currentDate.split('-')[1]);
    var day = Number(currentDate.split('-')[2]);

    var datas = new Array();

    // 형식 : /list/:factor/:serial/:date/one
    var graphDataQuery = "list/" + sensors[0] + "/" + selectedSensor + "/" + currentDate + "/one";
    $.ajax({
        dataType: "jsonp",
        url: myServerIP + ":" + myServerPort + "/" + graphDataQuery, //[TBD]추후 baseURL 로 교체해야함 (현재 복호화때문에 별도 서버 우회중, 교체 후 값사용 시 복호화 해서 사용해야함)
        type: "GET",
        success: function(response) {
            var currentSensorIndex = 0;

            for (j = 0; j < response.graphItems.length; j++) {
                var item = response.graphItems[j];

                var hour = Number(item.update_time.split(':')[0]);
                var value = Number(item.temperature);

                datas[j] = {
                    marker: {
                        symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)'
                    },
                    x: Date.UTC(year, month - 1, day, hour, 0, 0),
                    y: value
                };

            }
            drawWeatherGraph(selectedSensor, datas, date);
        },
        error: function(response, status, error) {
            alert("sensor value loading failure : " + status + ", " + error);
        }
    });

    drawWeatherGraph(selectedSensor, datas, date);
}

function drawWeatherGraph(selectedSensor, datas, currentDate) {
    $('#weatherGraph').html('');
    //간혹 그래프 데이터가 제대로 수신 안될경우 다시 요청해서 받아옴
    //alert(datas[i]);
    if (datas.length == 0) {
        isDontDraw = true;
    }
    var title = "온도";
    var valueSuffix = "℃";
    valueSuffix += "℃";
    $('<div class="chart" style="margin-top:1em;">')
        .appendTo('#weatherGraph')
        .highcharts({
            chart: {
                backgroundColor: 'rgba(0,0,0,0)',
                type: 'spline'
            },
            title: {
                text: '시간대별 날씨'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: '',
                labels: {
                    formatter: function() {
                        return this.value + '°';
                    }
                }
            },
            exporting: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {
                crosshairs: true,
                shared: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        radius: 4,
                        lineColor: '#666666',
                        lineWidth: 1
                    }
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: '온도(℃)',
                marker: {
                    symbol: 'square'
                },
                data: datas
            }]
        });
}

//코드에 해당하는 별도로 만든 이미지의 경로 불러오기
function getImageSrc(code) {
    return 'img/weather/' + code + '.png';
}


// =====================================================================
// 카메라 이미지 목록 출력
function setJournalCameraImg(date) {
    var noImagePath = "this.src='img/noImage.png'";
    for (var i = 0; i < 12; i++) {
        $("#cropImg_" + i).html('<img style="width:100%; height:auto;" onclick="popupShow(' + i + ', \'crop\', \'' + date + '\')" onerror="' + noImagePath + '" src="' + getCamImageSrc("crop", date, i * 2) + '">');
        $("#bugImg_" + i).html('<img style="width:100%; height:auto;" onclick="popupShow(' + i + ', \'bug\', \'' + date + '\')" onerror="' + noImagePath + '" src="' + getCamImageSrc("bug", date, i * 2) + '">');
    }
}

//팝업 출력
//num : 영농 일지페이지에서 몇번째 이미지를 눌렀는지
//type : 작물인지 해충인지
//date : 날짜
var selectedCamImgNum; //팝업 창에 보여지고 있는 이미지의 번호가 저장될 변수
var selectedCamType;

function popupShow(num, type, date) {
    var noImagePath = "this.src='img/noImage.png'";
    selectedCamImgNum = num;
    selectedCamType = type;
    $('#popupImg').attr("src", getCamImageSrc(type, date, num * 2));

    for (var i = 0; i < 12; i++) {
        $("#popupBottomDiv_" + i).html('<img id="popupBottomImg' + i + '" style="width:100%; height:4em;" onerror="' + noImagePath + '" src="' + getCamImageSrc(type, date, i * 2) + '" alt=""></div>');
        $("#popupBottomText_" + i).removeClass('selectedImgBorder');
    }

    $("#popupBottomText_" + num).addClass('selectedImgBorder');

    $('#popup').fadeIn();
    $('#mask').fadeTo("slow", 0.8);
}

function popupClose() {
    $('#popup').fadeOut();
    $('#mask').fadeOut();
}

function clickNextCamImg() {
    var targetImg = selectedCamImgNum + 1; //[추후]저장되는 이미지의 이름 형식에 맞게 변형을 해야됨
    if (targetImg > 11) { //마지막(12번) 이미지에서 다음 버튼을 눌렀는지 확인
        targetImg = 0;
    }

    changeCamImg(targetImg);
}

function clickPreCamImg() {
    var targetImg = selectedCamImgNum - 1; //[추후]저장되는 이미지의 이름 형식에 맞게 변형을 해야됨
    if (targetImg < 0) { //첫(1번) 이미지에서 이전 버튼을 눌렀는지 확인
        targetImg = 12;
    }

    changeCamImg(targetImg);
}

function changeCamImg(imgNum) {
    $('#popupImg').attr("src", getCamImageSrc(selectedCamType, selectedDate_, imgNum * 2));

    selectedImgHilight(imgNum);
    selectedCamImgNum = imgNum;
}

function popupChange(selectedDivNum) {
    var imgSrc = $('#popupBottomImg' + selectedDivNum).attr('src');

    $('#popupImg').attr("src", imgSrc);
    // $('#popupImg').fadeOut();
    // setTimeout(function() {
    //     $('#popupImg').attr("src", imgSrc);
    //     $('#popupImg').fadeIn();
    // }, 400);

    selectedImgHilight(selectedDivNum);
    selectedCamImgNum = selectedDivNum;
}

function selectedImgHilight(currentSeletedImgNum) {
    $("#popupBottomText_" + selectedCamImgNum).removeClass('selectedImgBorder');
    $("#popupBottomText_" + currentSeletedImgNum).addClass('selectedImgBorder');
}

//해당하는 카메라 이미지 주소 리턴
//type : crop, bug 두타입으로 나뉨
//date : 언제 카메라 영상인지
//time : 몇시 카메라 영상인지
var cropCamIP;
var cropCamPORT;
var bugCamIP;
var bugCamPORT;

function setCamURL() {
    cropCamIP = '';
    cropCamPORT='';
    bugCamIP = '';
    bugCamPORT = '';
    var query = selectedSensor;
    var signature = createhmac(query);
    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "/camera/list/sensor/" + selectedSensor,
        type: "GET",
        dataType: "json",
        headers:{"X-Signature":signature},
        success: function(response) {
            if(response.status !== 'fail'){
                if (response.data[0].url != null && response.data[0].url != "") {
                    cropCamIP = response.data[0].url.split(":")[1].split("//")[1];
                    cropCamPORT = response.data[0].url.split(":")[2];
                }

                if (response.data[1].url != null && response.data[1].url != "") {
                    cropCamIP = response.data[1].url.split(":")[1].split("//")[1];
                    cropCamPORT = response.data[1].url.split(":")[2];
                }

                setJournalCameraImg(selectedDate_);
            }
        },
        error: function(response, status, error) {}
    });
}

function getCamImageSrc(type, date, time) {

    var imgRootPath = "../img/camera";
    var folderDir = imgRootPath + "/" + date + "/";
    if (type == "crop") folderDir += cropCamIP + "_" + cropCamPORT + "/";
    else if (type == "bug") folderDir += bugCamIP + "_" + bugCamPORT + "/";
    if (time < 10) time = '0' + time;
    return folderDir + time + '.png';
}

function downloadCalPopupShow() {
    $('#downloadStartDate').val(selectedDate_);
    $('#downloadEndDate').val(selectedDate_);

    $('#downloadMask').fadeIn(1);
}

function downloadCalPopupClose() {
    $('#downloadMask').fadeOut();
}

function downloadData() {
    var startDate = $('#downloadStartDate').val();
    var endDate = $('#downloadEndDate').val();

    var downLinkUrl = myServerIP + ":" + sensorServerPort + "/export/excel/all/";
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

function saveJournal(){
    var significant = $("#significant").val();
    var condition = $("#condition").val();
    var usercode = getCookie(cookie_usercode);
    var serial = selectedSensor;
    var date = selectedDate_;

    var query = usercode;
    var signature = createhmac(query);
    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "/journal",
        type: "POST",
        dataType: "json",
        headers:{"X-Signature":signature},
        data:{
            significant : significant,
            condition : condition,
            usercode :usercode,
            serial : serial,
            date : date
        },
        success: function(response) {
            if(response.status !== 'fail')
                alert('저장하였습니다.');
            else{
                alert('저장하지 못하였습니다.');
            }
        },
        error: function(response, status, error) {}
    });
}

function refreshJournal(){
    var serial = selectedSensor;
    var date = selectedDate_;
    var query = serial+"";
    console.log(serial);
    console.log(date);
    var signature = createhmac(query);
    $.ajax({
        url: myServerIP + ":" + sensorServerPort + "/journal/"+query+"/"+date,
        type: "GET",
        dataType: "json",
        headers:{"X-Signature":signature},
        success: function(response) {
            if(response.status !== 'fail'){
                $("#significant").val(response.data[0].significant);
                $("#condition").val(response.data[0].condition);
            }else{
                $("#significant").val('');
                $("#condition").val('');
            }
        },
        error: function(response, status, error) {}
    });
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
