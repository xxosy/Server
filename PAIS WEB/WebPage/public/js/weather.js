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