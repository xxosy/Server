// 대기의 습도 관련 해서 각종 값을 구하는 함수들
// 우리가 알고 있는 팩터들 : 건구온도, 습도, 기압

//습구 온도 알아내는 함수
//dryTemp : 건구온도
//pressure : 기압
//humidity : 습도
function getWetTemperature(dryTemp, pressure, humidity) {
    var min = -20; //습구온도의 최저값
    var max = 50; //습구온도의 최고값

    var tw = 0;
    var calculatedHumidity = 0;

    var errorRange = 0.001;

    var count = 0;
    while (true) {
        tw = (min + max) / 2;
        calculatedHumidity = (6.112 * (Math.exp((17.67 * tw) / (tw + 243.5))) -
                pressure * (dryTemp - tw) * 0.00066 * (1 + (0.00115 * tw))) *
            100 / (6.112 * Math.exp((17.67 * dryTemp) / (dryTemp + 243.5)));

        if (calculatedHumidity >= humidity - errorRange && calculatedHumidity <= humidity + errorRange)
            break;
        else {
            if (calculatedHumidity > humidity) max = tw;
            else min = tw;
            count++;
        }
        if(count > 30) break;
    }

    //console.log("반복횟수 : " + count);
    return tw;
}

//절대 증기압
function getPVA(dryTemp, wetTemp, pressure) {
    return 6.112 * Math.exp((17.67 * wetTemp) / (wetTemp + 243.5)) - pressure * (dryTemp - wetTemp) * 0.00066 * (1 + (0.00115 * wetTemp));
}

//이슬점
function getDEW(dryTemp, wetTemp, pressure) {
    var pva = getPVA(dryTemp, wetTemp, pressure);
    return (243.5 * Math.log(pva / 6.112)) / (17.67 - Math.log(pva / 6.112));
}

//총 증기 밀도
function getDVT(dryTemp) {
    return 0.00036 * (dryTemp * dryTemp * dryTemp) + 0.00543 * (dryTemp * dryTemp) + 0.37067 * dryTemp + 4.81865;
}

//절대 습도
function getHA(humidity, dryTemp) {
    var dvt = getDVT(dryTemp);
    return humidity * dvt / 100;
}

//HD
function getHD(humidity, dryTemp) {
    return getHA(100, dryTemp) - getHA(humidity, dryTemp);
}

//VPD
function getVPD(dryTemp, wetTemp, pressure, humidity) {
    var maxWetTemp = getWetTemperature(dryTemp, pressure, 100);
    return (getPVA(dryTemp, maxWetTemp, pressure) - getPVA(dryTemp, wetTemp, pressure)) / 10;
}
