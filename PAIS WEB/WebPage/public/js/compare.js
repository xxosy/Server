//============================================================================================

//각종 데이터 세팅

var sensors = new Array();

sensors[0] = 'temperature';

sensors[1] = 'humidity';

sensors[2] = 'light';

sensors[3] = 'co2';

sensors[4] = 'ph';

sensors[5] = 'ec';

sensors[6] = 'temperature_ds';

sensors[7] = 'vpd';

sensors[8] = 'hd';

sensors[9] = "medium_weight";

sensors[10] = "drain_weight";



let choiceDates = new Set();

let datas = new Array();

let colorIndex=0;

let dateCount=0;

let totalSupValue = 0;

let totalDrainWeight = 0;

let mm;

let yy;



function setDatas(date) {

    init();

}



//============================================================================================

//달력 세팅

function init() {

    let temp = new Date();

    mm = temp.getMonth();

    yy = temp.getFullYear();

    initWeeksList();

}



function initWeeksList() {

    for(i=0; i<5; i++)

    {

        addWeeksList();

    }



    let cd = new Date();

    let tmp = cd.getDate();



    $('#weeksDiv').scroll(function() {

        var scrollT = $(this).scrollTop();

        var scrollH = $(this).outerHeight();

        var contentH = $('#weeksList').height();



        if(scrollT + scrollH >= contentH) {

            addWeeksList();

        }

    })

}



function leadingZeros(num) {

    if(num < 10) return '0'+num;

    return num;

}



function getLastDate(y) {

    var lastDate = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)

    {

        lastDate[1] = 29;

    }

    return lastDate;

}



function getDateForm(y, m, d) {

    return y+'-'+m+'-'+d;

}



function addWeeksList() {

    var lastDate = getLastDate(yy);



    var e = '<h4 style="margin-bottom:0">'+yy+'년 '+(mm+1)+'월'+'</h4>';

    $('#weeksList').append(e)



    let today = new Date();

    let d = new Date();

    d.setDate(1);

    d.setMonth(mm);

    d.setFullYear(yy);



    let i = 0;

    let start = 1-d.getDay();

    let end = lastDate[mm];

    let weekStarts = new Array();

    let weekEnds = new Array();

    for(let n=start; n<=end; n+=7) {

        weekStarts[i] = n;

        weekEnds[i] = n+6;

        i++;

    }



    if(weekEnds[weekEnds.length-1] > lastDate[mm]) {

        weekEnds[weekEnds.length-1] -= lastDate[mm];

    }



    for(let i=0; i<weekStarts.length; i++) {

        let id;

        if(yy == today.getFullYear() && mm == today.getMonth() && weekStarts[i] > today.getDate()) break;



        if(weekStarts[i] < 1) {

            weekStarts[0] += lastDate[(mm+11)%12];

            id = getDateForm(yy, mm, weekStarts[i]);

        }

        else {

            id = getDateForm(yy, mm+1, weekStarts[i]);

        }



        // 날짜 중복 처리(한 주가 두 달에 걸쳐 있는 경우)

        if($("#"+id).length == 0) {

            e = '<a id="'+id+'" class="w3-row" style="margin-top:0; margin-bottom:0; display:block; width:100%; cursor:pointer" onClick="clkWeek(this)">'+leadingZeros(weekStarts[i])+' ~ '+leadingZeros(weekEnds[i])+'</a>';

        } else {

            e = '<a id="'+ id+"_repeat" +'" class="w3-row" style="margin-top:0; margin-bottom:0; display:block; width:100%; cursor:pointer" onClick="clkWeek(this)">'+leadingZeros(weekStarts[i])+' ~ '+leadingZeros(weekEnds[i])+'</a>';

        }

        $('#weeksList').append(e);

    }



    mm--;

    if(mm == -1)

    {

        yy--;

        mm=11;

    }

}



function redrawCalendar(btn, val) {

    let tmp = $('#date').text().split('-');

    let m = parseInt(tmp[1]);

    let y = parseInt(tmp[0]);



    switch(btn)

    {

        case 'lastYear' : y--; break;

        case 'lastMonth' : m--; break;

        case 'nextMonth' : m++; break;

        case 'nextYear' : y++; break;

    }



    if(m < 1)

    {

        m = 12;

        y--;

    }

    else if(m > 12)

    {

        m = 1;

        y++;

    }



    $('#date').html( y + '-' + leadingZeros(m) );

    drawCalendar();

}



function drawCalendar() {

    if($('#date').html() == '')

    {

        let d = new Date();

        $('#date').html( d.getFullYear() + '-' + leadingZeros(d.getMonth()+1) );

    }



    let ym = $('#date').html().split('-');

    let calendarDate = new Date();

    calendarDate.setDate(1);

    calendarDate.setMonth(ym[1]-1);

    calendarDate.setFullYear(ym[0]);



    let dateString = new Array('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');

    let lastDate = getLastDate(ym[0]);



    let calendarStartDay = calendarDate.getDay();

    let calendarLastDate = lastDate[calendarDate.getMonth()];

    let week = Math.ceil((calendarStartDay + calendarLastDate) / 7);   //총 몇 주인지 구함.



    let today  = new Date();

    let tdStyle = "padding: 1em 0em;";



    let calendar = '';

    let n = 1 - calendarStartDay;



    for (let i = 0; i < week; i++)

    {

        calendar += '<tr>';

        for (let j = 0; j < 7; j++, n++)

        {

            if (n < 1 || n > calendarLastDate)

            {

                calendar += '				<td style="' + tdStyle + '" class="day disable ' + dateString[j] + '"></td>';

                continue;

            }



            calendarDate.setDate(n);

            let d = getDateForm(calendarDate.getFullYear(), calendarDate.getMonth()+1, calendarDate.getDate());



            if(calendarDate <= today)

            {

                if(choiceDates.has(d))

                {

                    calendar += '	<td id="' + 'day_' + n + '" style="cursor:pointer; '+"background-color:rgba(255, 255, 255, 0.3);" + tdStyle + '" onClick="clkCalendarDate(this)" class="aniEle day ' + dateString[j] + '">' + n + '</td>';

                }

                else

                {

                    calendar += '	<td id="' + 'day_' + n + '" style="cursor:pointer; ' + tdStyle + '" onClick="clkCalendarDate(this)" class="aniEle day ' + dateString[j] + '">' + n + '</td>';

                }

            }

            else

            {

                calendar += '<td id="' + 'day_' + n + '" style="' + tdStyle + '" class="day ' + dateString[j] + ' disable">' + n + '</td>';

            }

        }

        calendar += '			</tr>';

    }

    $('#calendarTable').html(calendar);

}



function clkWeek(e) {

    let id = e.id.split("_repeat");  // 한 주가 두 달에 걸쳐 있는 경우 처리

    clkCommonEvent(id[0]);

}



function clkCalendarDate(e) {

    let ym = $('#date').text().split('-');

    let y = parseInt(ym[0]);

    let m = parseInt(ym[1]);

    let d = $(e).text();

    let selectDate = new Date();

    selectDate.setFullYear(y);

    selectDate.setDate(d);

    selectDate.setMonth(m-1);



    d = selectDate.getDate() - selectDate.getDay();



    if(d < 1) {

        let lastDates = getLastDate(y);

        let lastMonth = (m+10)%12;

        let lastDate = lastDates[lastMonth];

        m--;

        d += lastDate;

    }



    let ymd = getDateForm(y, m, d);

    clkCommonEvent(ymd);

}



function clkSelectionDate(e) {

    let id = e.id.split('_')[0];

    clkCommonEvent(id);

}



function clkCommonEvent(startDateForm) {

    let ymd = startDateForm.split('-');

    let d = parseInt(ymd[2]);

    let m = parseInt(ymd[1]);

    let y = parseInt(ymd[0]);

    let n = 7;



    let lastDate = getLastDate(y);

    let lastDays = lastDate[m-1];



    let calYear = parseInt($('#date').text().split('-')[0]);

    let calMonth = parseInt($('#date').text().split('-')[1]);



    let color = $('#'+startDateForm).css('background-color')

    let id = startDateForm+"_selection"



    let dateList = new Array();

    for(i=0; i<n; i++)

    {

        if(color == 'rgba(0, 0, 0, 0)')

        {

            if(calMonth == m && calYear == y) {

                $("#day_"+d).css('background-color', 'rgba(255, 255, 255, 0.3)')

            }

            choiceDates.add(getDateForm(y, m, d));

            dateList[i] = getDateForm(y, m, d);

        }

        else {

            if(calMonth == m && calYear == y) {

                $("#day_"+d).css('background-color', 'rgba(0, 0, 0, 0)')

            }

            choiceDates.delete(getDateForm(y, m, d));

        }



        d++;

        if(d>lastDays)

        {

            m++;

            if(m==13) {

                y++;

                m=1;

                lastDate = getLastDate(y);

            }

            lastDays = lastDate[m-1];

            d=1;

        }

    }



    let chartName = startDateForm + ' ~ ' + getDateForm(y, m, d);

    if(color == 'rgba(0, 0, 0, 0)')

    {

        $('#'+startDateForm).css('background-color', 'rgba(255, 255, 255, 0.3)');

        $('#'+startDateForm+"_repeat").css('background-color', 'rgba(255, 255, 255, 0.3)'); // 한 주가 두 달에 걸쳐 있는 경우 처리

        $('#selectionDateDiv').append('<a id="'+id+ '" style="cursor:pointer; background-color:rgba(100,100,100,0.5); margin:0.5em" onclick="clkSelectionDate(this)">' + chartName + '</a>')

        addGraphDatas(chartName, dateList);

    }



    else if(color == 'rgba(255, 255, 255, 0.3)')

    {

        $('#'+startDateForm).css('background-color', 'rgba(0, 0, 0, 0)');

        $('#'+startDateForm+"_repeat").css('background-color', 'rgba(0, 0, 0, 0)'); // 한 주가 두 달에 걸쳐 있는 경우 처리

        $('#'+id).remove();

        $("#data_avg_table tr[id='"+chartName+"_row']").remove();

        removeGraphDatas(chartName);

    }

}



function addGraphDatas(chartName, dateList) {

    let guideVpdData = new Array();

    let guideHdData = new Array();



    if($('#graphCompare').html() == '') {

        for(var i=0; i<sensors.length; i++) {

            createGraphTemplete(sensors[i]);

        }

        setVpdHdGuideLine();

    }



    colorIndex = (colorIndex+1) % 10;

    if(colorIndex == 1) colorIndex++;  // 1은 검은색이라 가시성 떨어짐



    let chart;

    for(let i=0; i<sensors.length; i++) {

        chart = $('#'+sensors[i]).highcharts()

        chart.addSeries({

            type: 'line',

            name: chartName,

            colorIndex: colorIndex

        });

    }



    let chartIndex;

    for(let i=0; i<chart.series.length; i++)

    {

        if(chart.series[i].name == chartName)

        {

            chartIndex = i;

            break;

        }

    }



    for(let i=0; i<sensors.length; i++){

        datas[i] = new Array();

    }



    for(let i=0; i<dateList.length; i++)

    {

        // let completingRate = ( (i+1) / sensors.length ) * 100

        // $('#loadingDiv').html("로딩중 "+completingRate+"%");

        let date = dateList[i];

        setGraphDatas(chartIndex, i, date);

    }

    // $('#loadingDiv').html('');

    console.log(dateList);



    // 온도, 습도, 조도, CO2, 지온, 급액량, 배액량

    let showedSenseors = ['temperature', 'humidity', 'light', 'co2', 'temperature_ds', "medium_weight", "drain_weight"];

    let units = ['℃', '%', 'lux', 'ppm', '℃', 'L', 'L']

    let tableRow = "<tr class='w3-text-white' style='text-align:center;'' id='"+chartName+"_row'><td>"+chartName+"</td>";

    for(let i=0; i<showedSenseors.length; i++) {

        let sensorIndex = sensors.indexOf(showedSenseors[i]);

        let count=0;

        let total=0;

        console.log(datas[sensorIndex].length);

        for(let k=0; k<datas[sensorIndex].length; k++) {

            count++;

            total += parseFloat(datas[sensorIndex][k][1]);

        }



        let avg = 0;

        // 급액 및 배액의 일 평균값 계산 코드

        // if(showedSenseors[i] == "medium_weight") {

        //     avg = totalSupValue/dateCount;

        // }

        // else if(showedSenseors[i] == "drain_weight") {

        //     avg = totalDrainWeight/dateCount;

        // }

        // else {

        //     avg = total/count;

        // }

        // tableRow += "<td>"+avg.toFixed(2)+units[i]+"</td>"



        // 급액 및 배액 제외하고 표시 코드

        if (showedSenseors[i] == "medium_weight" || showedSenseors[i] == "drain_weight") {

            tableRow += "<td>" + "</td>";

        } else {

            avg = total / count;

            tableRow += "<td>"+avg.toFixed(2)+units[i]+"</td>"

        }

    }

    tableRow += "</tr>";

    $('#data_avg_table').append(tableRow);



    for(let i=0; i<sensors.length; i++){

        chart = $('#'+sensors[i]).highcharts();

        if(i==7 || i==8) {  // 7,8은 vpd와 hd를 의미하며, hd와 vpd는 가이드라인 그래프가 Index 0

            chart.series[chartIndex+1].setData( kalman(datas[i]), true );

        } else {

            chart.series[chartIndex].setData( kalman(datas[i]), true );

        }

    }



    totalSupValue = 0;

    totalDrainWeight = 0;

}



function setVpdHdGuideLine() {

    let time = 0;

    let hdData = new Array();

    let vpdData = new Array();

    for (var i = 0; i < 10080; i++) {

        hdData[i] = [time, 3, 8];

        vpdData[i] = [time, 0.5, 1.2];

        time += 60000;

    }

    for(let i=7; i<=8; i++) {

        let name;

        let data;

        if(i==7) {

            name = '최적 VPD'

            data = vpdData

        } else if(i==8) {

            name = '최적 HD'

            data = hdData

        }

        chart = $('#'+sensors[i]).highcharts()

        chart.addSeries(

            {

                name: name,

                data: data,

                type: 'arearange',

                lineWidth: 1.2,

                linkedTo: ':previous',

                color: '#f7f700',

                fillOpacity: 0.3,

                zIndex: 0

            }

        );

    }

}



function removeGraphDatas(chartName) {

    let chart;

    for(let i=0; i<sensors.length; i++) {

        chart = $('#'+sensors[i]).highcharts()

        for(let i=0; i<chart.series.length; i++) {

            if(chart.series[i].name == chartName) {

                chart.series[i].remove();

            }

        }

    }

    if(chart.series.length == 0) {

        $('#graphVpdHd').html('');

        $('#graphCompare').html('');

        $('#graphChannel').html('');

    }

}



function createGraphTemplete(sensor) {

    var series = new Array();

    var valueSuffix;

    var title;



    let div;



    switch(sensor) {

        case "temperature" :    title="온도";     valueSuffix=" ℃";        div="graphCompare";    break;

        case "humidity" :       title="습도";     valueSuffix=" %";         div="graphCompare";    break;

        case "light" :          title="광량";     valueSuffix=" lux";       div="graphCompare";    break;

        case "co2" :            title="CO₂";      valueSuffix=" ppm";       div="graphCompare";    break;

        case "ph" :             title="PH";       valueSuffix=" ph";        div="graphCompare";    break;

        case "ec" :             title="EC";       valueSuffix=" ms/cm";     div="graphCompare";    break;

        case "temperature_ds" : title="지온";     valueSuffix=" ℃";        div="graphCompare";    break;

        case "vpd" :            title="VPD";      valueSuffix=" kPa";       div="graphVpdHd";    break;

        case "hd" :             title="HD";       valueSuffix=" g/m³";      div="graphVpdHd";    break;

        case "medium_weight" :  title="배지 무게"; valueSuffix=" Kg";        div="graphChannel";    break;

        case "drain_weight" :   title="배액량";    valueSuffix=" Kg";        div="graphChannel";    break;

    }



    $('<div id="'+sensor+'" class="chart">')

    .appendTo('#'+div)

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

            itemStyle: {

                color: '#FFF',

                fontWeight: 'bold'

            },

            itemHiddenStyle: {

                color: '#888'

            }

        },

        xAxis: {

            type:'datetime',

            dateTimeLabelFormats : {

                day: '%H:%M'

            },

            crosshair: true,

            events: {

                setExtremes: syncExtremes

            }

        },

        yAxis: {

            gridLineColor:'#555',

            title: {

                text: null

            }

        },

        tooltip: {

            crosshairs: true,

            shared: true,

            valueDecimals: 2,

            valueSuffix: valueSuffix

        },

        exporting: {

            enabled: false

        },

        series: []

    });

}



function setGraphDatas(chartIndex, dataSeq, date) {

    var graphDataQuery = "/value/list/all/" + selectedSensor + "/" + date;
    let signature = createhmac(selectedSensor);


    $.ajax({

        dataType: "json",

        url: myServerIP + ':' + sensorServerPort + graphDataQuery, //[TBD]추후 baseURL 로 교체해야함 (현재 복호화때문에 별도 서버 우회중, 교체 후 값사용 시 복호화 해서 사용해야함)

        type: "GET",

        async: false,

        headers:{"X-Signature":signature},

        success: function(response) {

            var currentSensorIndex = 0;

            if(response.statecode === 200){

                dateCount++;

                let base = datas[0].length;



                let isDraining = false;

                let isSupplying = false;

                let preDrainWeight = 0;

                let prepreDrainWeight = 0;

                let useValue = 0;

                let supValue = 0;

                let preUseValue = 0;

                let tempUseValue = 0;

                var abmormalDrainIndexs = new Array();

                let drainStartIndex = 0;

                let drainStartValue = 0;

                let useDatas = new Array();

                for (let i = 0; i < response.data.length; i++) {

                    var item = response.data[i];



                    var hour = Number(item.update_time.split(':')[0]);

                    var min = Number(item.update_time.split(':')[1]);



                    let date = new Date(2000, 1, dataSeq+1, hour, min, 0, 0);

                    let time = (24*60*dataSeq + 60*hour + min)*60000;



                    // 미기후 정보

                    datas[0][base+i] = [time, Number(item.temperature)];

                    datas[1][base+i] = [time, Number(item.humidity)];

                    datas[2][base+i] = [time, Number(item.light)];

                    datas[3][base+i] = [time, Number(item.co2)];

                    datas[4][base+i] = [time, Number(item.ph)];

                    datas[5][base+i] = [time, Number(item.ec)];

                    datas[6][base+i] = [time, Number(item.temperature_ds)];



                    // VPD&HD 정보

                    var pressure = 1013; //[TBD] 추후 다르게 수집한 기압 대입 해야함

                    var dryTemp = Number(item.temperature);

                    var humidity = Number(item.humidity);

                    var wetTemp = getWetTemperature(dryTemp, pressure, humidity);

                    datas[7][base+i] = [time, getVPD(dryTemp, wetTemp, pressure, humidity)];    // VPD

                    datas[8][base+i] = [time, getHD(humidity, dryTemp)];    // HD





                    // 배지 정보

                    var mediumWeight = Number(item.medium_weight) / 1000;

                    var drainWeight = Number(item.drain_weight) / 1000;

                    if (i == 0) {

                        preDrainWeight = drainWeight;

                        prepreDrainWeight = preDrainWeight;



                        preMediumWeight = mediumWeight;

                        prepreMediumWeight = preMediumWeight;

                    } else {

                        // 배액량 계산

                        if(drainWeight > preDrainWeight) {

                            if(preDrainWeight-prepreDrainWeight < -0.2 && drainWeight-preDrainWeight > 0.2) { } // 에러 데이터

                            else {

                                if(isDraining == false) {

                                    drainStartIndex = i;

                                    tempUseValue = drainWeight-preDrainWeight

                                    drainStartValue = useValue;

                                } else {

                                    tempUseValue += drainWeight-preDrainWeight

                                }

                                isDraining = true

                                useValue += drainWeight-preDrainWeight

                            }

                        }

                        else if (drainWeight-preDrainWeight < -0.5 && preDrainWeight-prepreDrainWeight > 0.5) { // 에러 데이터 그래프에서 제거

                            let errorAmount = preDrainWeight-drainWeight;

                            useValue -= errorAmount;

                            datas[10][base+i-1][1] -= errorAmount;

                        }

                        else if (isDraining) {

                            if(drainWeight > prepreDrainWeight) {

                                useValue += drainWeight-preDrainWeight

                                preUseValue -= (drainWeight-preDrainWeight) / 2

                                abmormalDrainIndexs.push(i - 1)

                            } else if(drainWeight <= preDrainWeight) {

                                if(tempUseValue < 0.01) {

                                    for(k = drainStartIndex; k<i; k++) {

                                        datas[10][base+k][1] = drainStartValue

                                    }

                                    useValue = drainStartValue

                                }

                                isDraining = false

                            }

                        }



                        // 급액 횟수&시간 구하기

                        if(mediumWeight > preMediumWeight) {

                            if(preMediumWeight-prepreMediumWeight < -0.5 && mediumWeight-preMediumWeight > 0.5) { // 에러 데이터 그래프에서 제거

                                // datas[i-1][1] = (mediumWeight + prepreMediumWeight) / 2

                            }

                            else if(!isSupplying && mediumWeight-preMediumWeight < 0.01) {} //미세하게 진동하는 값 무시

                            else {

                                if(!isSupplying) {

                                    supValue = 0

                                }

                                isSupplying = true

                                isFinishSupplying = false

                                supValue += mediumWeight-preMediumWeight

                                if(isDraining) supValue += drainWeight-preDrainWeight

                            }

                        } else if (mediumWeight-preMediumWeight < -0.2 && preMediumWeight-prepreMediumWeight > 0.2) { // 에러 데이터 그래프에서 제거

                            let errorAmount = preMediumWeight-mediumWeight

                            supValue -= errorAmount

                            // datas[i-1][1] -= errorAmount

                        } else if(isSupplying) {

                            isSupplying = false

                            if(supValue > 0.05) {

                                // supplyCount++

                                totalSupValue += supValue

                            }

                        }



                        prepreDrainWeight = preDrainWeight;

                        preDrainWeight = drainWeight;



                        prepreMediumWeight = preMediumWeight;

                        preMediumWeight = mediumWeight;

                    }



                    preUseValue = useValue;

                    datas[9][base+i] = [time, mediumWeight];

                    datas[10][base+i] = [time, useValue];



                    while(abmormalDrainIndexs.length != 0) {

                        var pos = abmormalDrainIndexs.pop();

                        if(pos != 1 && pos != base+i)

                        datas[10][pos][1] = (datas[10][pos-1][1] + datas[10][pos+1][1]) / 2

                    }

                }

                totalDrainWeight += useValue;

            }

        },

        error: function(response, status, error) {

            console.log("sensor value loading failure : " + status + ", " + error);

        }

    });

}

