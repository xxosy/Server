$.lang['ko'] = {
    temperature: '온도',
    humidity: '습도',
    light: '조도',
    co2: 'CO₂',
    ph: 'PH',
    ec: 'EC',
    ds: '지온',

    wetTemp: '습구온도',
    dew: '이슬점',
    HD: 'HD',
    VPD: 'VPD',

    tb_installationLocation: '설치 위치 정보',
    tb_weather: '외부 날씨 및 예보',
    tb_VPDSuitability: '일일 VPD&HD 적합성',
    tb_calendar: '달력',
    realTimeCamera: '실시간 작물 이미지',
    realTimeData: '실시간 미기후 정보',
    controlFoundationInfo: '온·습도 제어 기초정보',
    humidityControlGuide: '습도 제어 도우미',
        vpdStatusLabel: 'VPD기반 온실 습도 상태',
        currentValueButton: '현재값으로',
        hdIdealGuide: '(적정 3~8 g/m³)',
        vpdIdealGuide: '(적정 0.5~1.2 kPa)',
        humidityIdeal: '적정',
        humidityDry: '건조',
        humidityHumid: '과습',
        controlSolution1: "현재 온도에서 </br> <h3 style='display:inline; color:#33ccff'>가습</h3>이 필요합니다.",
        controlSolution2: "작물이 생장하는데 최적의 환경입니다.",
        controlSolution3: "현재 온도에서 </br> <h3 style='display:inline; color:#ff9933'>제습</h3>이 필요합니다.",
    dailyVariationTotalGraph: '미기후 통합 정보',
    dailyVariationClimateGraph: '온실 대기 변화 추이',
    dailyVariationVPDGraph: 'VPD&HD 적합성 변화 추이',
    dailyVariationGraph: '미기후 항목별 변화 추이',

    // 공통 레이블
    map_markerTitle: '명 칭',
    map_markerSerial: '시리얼',
    map_markerEdit: '수정',
    map_markerDelete: '삭제',
    map_msgUnacivateSensor: '제품을 삭제하시겠습니까?',
    map_msgActivationSensor: '제품 등록이 완료되었습니다.',

    // 배지 정보 모니터링 레이블
    tb_realTimeWeight: '실시간 배지 무게 및 배액',
    weight_channel: '배지 무게',
    weight_drainage: '배액량',
    weight_scale: '배액 저울 변화',
    tb_calculatedWeightInfo: '실시간 배지 정보',
        supply_number: '급액 횟수',
        supply_time: '급액 시간',
        supply_amount: '총급액량',
        drainage_amount: '총배액량',
        predict_freshWeight: '생체중량(예측)',
        predict_evaporation: '증발산량(예측)',
    tb_combinedWeightChart: '배지 통합 정보',
    tb_individualWeightChart: '배지정보 항목별 변화 추이',

    menu_climate: '미기후 정보',
    menu_weight: '배지 정보',
    menu_journal: '영농 일지',
    menu_addSensor: '제품 등록',
    menu_logout: '로그아웃',

    zoomIn: '확대',
    zoomOut: '축소',
    reset: '초기화',
    close: '닫기',

    tb_record: '기록',
        dailyTemperature: '일 평균 온실 온도',
        dailyHumidity: '일 평균 온실 습도',
        dailyHumidity: '일 평균 온실 습도',
        cultivationSituation: '재배현황',
        relevantFacts: '특이사항',
    td_weather: '날씨',
    td_cropGrowthImages: '작물 생육 이미지',
        cropGrowthImages1: '작물 생육 이미지 Ⅰ',
        cropGrowthImages2: '작물 생육 이미지 Ⅱ',

    pleaseSetDate: '기간을 선택하여 주세요.',
        startDate: '시작날짜',
        endDate: '종료날짜',

    enterProductKey: '제품에 표시된 제품키를 입력하세요.',

    times: '회',
    monday_long: '월요일',
    tuesday_long: '화요일',
    wednesday_long: '수용일',
    thursday_long: '목요일',
    friday_long: '금요일',
    saturday_long: '토요일',
    sunday_long: '일요일',
    monday_short: '월',
    tuesday_short: '화',
    wednesday_short: '수',
    thursday_short: '목',
    friday_short: '금',
    saturday_short: '토',
    sunday_short: '일',

    // 달 표기
    january: '1월',
    february: '2월',
    march: '3월',
    april: '4월',
    may: '5월',
    june: '6월',
    july: '7월',
    august: '8월',
    september: '9월',
    october: '10월',
    november: '11월',
    december: '12월',

    // 구현 예정
    unimplement: '구현 예정',
}

function KoreanLanguage() {}

KoreanLanguage.prototype.shortMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
KoreanLanguage.prototype.weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
KoreanLanguage.prototype.week = ['일', '월', '화', '수', '목', '금', '토'];

//제품 등록 창
KoreanLanguage.prototype.newSensorActivation = '새 제품 등록';

KoreanLanguage.prototype.msg_nullTitleError = '명칭을 기입해주세요.';
KoreanLanguage.prototype.msg_nullSensorSerialError = '환경센서(미기후), 배지센서 중 하나의 시리얼번호는 입력되어야 합니다.';
KoreanLanguage.prototype.msg_microClimateSensorError = '환경센서 시리얼번호가 유효하지 않습니다.';
KoreanLanguage.prototype.msg_soilMoistureSensorError = '배지센서 시리얼번호가 유효하지 않습니다.';
KoreanLanguage.prototype.msg_sensorSerialError = '환경센서 또는 배지센서 시리얼번호가 유효하지 않습니다.';
KoreanLanguage.prototype.msg_sensorActivation = '제품 등록이 완료되었습니다.';

/******common.js*******/
    //위치 표시
    KoreanLanguage.prototype.common_map_title = '명 칭';
    KoreanLanguage.prototype.common_map_serial = '시리얼';
    KoreanLanguage.prototype.common_map_delete = '삭제';
    KoreanLanguage.prototype.msg_failure = 'sensor value loading failure';
    KoreanLanguage.prototype.msg_unactivateSensor = '제품을 삭제하시겠습니까?';

    //최적 표시 그래프
    KoreanLanguage.prototype.growableMaxTemperature = '생육 최고 온도';
    KoreanLanguage.prototype.idealTemperature = '최적 온도';
    KoreanLanguage.prototype.growableMinTemperature = '생육 최저 온도';
    KoreanLanguage.prototype.idealVPD = '적정 VPD';
    KoreanLanguage.prototype.idealHD = '적정 HD';

    //HD&VPD 통계
    KoreanLanguage.prototype.veryLow = '매우 낮음';
    KoreanLanguage.prototype.low = '낮음';
    KoreanLanguage.prototype.ideal = '적정';
    KoreanLanguage.prototype.high = '높음';
    KoreanLanguage.prototype.veryHigh = '매우 높음';




/******index.js*******/
    KoreanLanguage.prototype.realTimeData = '실시간 미기후 정보';

    KoreanLanguage.prototype.east = '동';
    KoreanLanguage.prototype.west = '서';
    KoreanLanguage.prototype.north = '북';
    KoreanLanguage.prototype.sourth = '남';

    // 수정요
    KoreanLanguage.prototype.no = '사용 불가';

    KoreanLanguage.prototype.controlSolution1 = "현재 온도에서 </br> <h3 style='display:inline; color:#33ccff'>가습</h3>이 필요합니다.";
    KoreanLanguage.prototype.controlSolution2 = "작물이 생장하는데 최적의 환경입니다.";
    KoreanLanguage.prototype.controlSolution3 = "현재 온도에서 </br> <h3 style='display:inline; color:#ff9933'>제습</h3>이 필요합니다.";

    KoreanLanguage.prototype.humid = '과습';
    KoreanLanguage.prototype.dry = '건조';




/*****journal.js*****/
    KoreanLanguage.prototype.log = '일지';



/*****weight.js*****/
    KoreanLanguage.prototype.times = '회';
    KoreanLanguage.prototype.unimplement = '(구현예정)';
    KoreanLanguage.prototype.channelWeight = '배지 무게';
    KoreanLanguage.prototype.amountOfDrainage = '배액량';
    KoreanLanguage.prototype.scale = '배액 저울 변화';



///////Ejs///////
KoreanLanguage.prototype.setEjs = function() {
    $('#language_en').html('English(US)');
    $('#language_ko').html('한국어');

    $('#tab-climate').html('미기후 정보');
    $('#tab-weight').html('배지 정보');
    $('#tab-sensor').html('제품 등록');
    $('#tab-journal').html('영농 일지');
    //$생육 정보
    $('#tab-logout').html('로그아웃');

    $('#sensorActiveLabel').html('제품이 배치될 장소를 선택해주세요.');

    $('#img_zoomIn').html('확대');
    $('#img_zoomOut').html('축소');
    $('#img_reset').html('초기화');
    $('#img_close').html('닫기');
}

KoreanLanguage.prototype.setIndexEjs = function() {
    KoreanLanguage.prototype.setEjs();

    $('#titleText').html('미기후 정보');

    $('#left_1').html('설치 위치 정보');
    $('#left_2').html('외부 날씨 및 예보');
    $('#left_3').html('일일 VPD&HD 적합성');

    $('#right_1').html('실시간 작물 이미지');
    $('#right_2').html('')
        $('#right_2_1').html('온도')
        $('#right_2_2').html('습도')
        $('#right_2_3').html('조도')
        $('#right_2_4').html('EC')
        $('#right_2_5').html('PH')
        $('#right_2_6').html('CO2')
        $('#right_2_7').html('지온')
    $('#right_3').html('온·습도 제어 기초정보')
        $('#right_3_1').html('습구온도')
        $('#right_3_2').html('이슬점')
        $('#right_3_3').html('HD')
        $('#right_3_4').html('VPD')
    $('#right_4').html('습도 제어 도우미') //
        $('#right_4_1').html('VPD기반 온실 습도 상태') //
        $('#right_4_2').html('현재값으로')
        $('#right_4_3').html('(적정 3~8 g/m³)')
        $('#right_4_4').html('(적정 0.5~1.2 kPa)')

    $('#long_1').html('미기후 통합 정보')
    $('#long_2').html('온실 대기 변화 추이')
    $('#long_3').html('VPD&HD 적합성 변화 추이') //
    $('#long_4').html('작물 생육 온도') //
    $('#long_5').html('미기후 항목별 변화 추이')
}

KoreanLanguage.prototype.setWeightEjs = function() {
    KoreanLanguage.prototype.setEjs();

    $('#titleText').html('배지 정보');

    $('#DailyTemperatureLabel').html('일 평균 온실 온도');
    $('#DailyHumidityLabel').html('일 평균 온실 온도');

    $('#left_1').html('달력');
    $('#left_2').html('설치 위치 정보');

    $('#right_1').html('실시간 배지 무게 및 배액량')
        $('#right_1_1').html('배지 무게')
        $('#right_1_2').html('배액량')
    $('#right_2').html('실시간 배지 정보')
        // $('#right_2_1').html('총급액횟수')
        // $('#right_2_2').html('급액시간')
        // $('#right_2_3').html('총급액량')
        // $('#right_2_4').html('총배액량')
        // $('#right_2_5').html('생체중량(예측)')
        // $('#right_2_6').html('증발산량(예측)')
    $('#right_3').html('외부 날씨 및 예보');

    $('#long_1').html('배지 통합 정보')
        $('#long_1_1').html('[다운로드]')
            $('#long_1_1_1').html('기간을 선택하여 주세요.');
            $('#long_1_1_2').html('시작날짜');
            $('#long_1_1_3').html('종료날짜');
            $('#downloadDataButton').html('다운로드');
    $('#long_2').html('배지정보 항목별 변화 추이');
}

KoreanLanguage.prototype.setJournalEjs = function() {
    KoreanLanguage.prototype.setEjs();

    $('#titleText').html('영농 일지');

    $('#left_1').html('달력');
    $('#left_2').html('실치 위치 정보');

    $('#right_1').html('기록')
        $('#right_1_1').html('저장')
        $('#right_1_2').html('재배현황')
        $('#right_1_3').html('특이사항')
    $('#right_2').html('날씨')
    $('#right_3').html('일일 VPD&HD 적합성');

    $('#long_1').html('작물 생육 이미지')
        $('#long_1_1').html('작물 생육 이미지 Ⅰ')
        $('#long_1_2').html('작물 생육 이미지 Ⅱ')
    $('#long_2').html('미기후 통합 정보');
        $('#long_2_1').html('[데이터 다운로드]')
            $('#long_2_1_1').html('기간을 선택하여 주세요.');
            $('#long_2_1_2').html('시작날짜');
            $('#long_2_1_3').html('종료날짜');
            $('#downloadDataButton').html('다운로드');
    $('#long_3').html('온실 대기 변화 추이');
    $('#long_4').html('VPD&HD 적합성 변화 추이');
    $('#long_5').html('작물 생육 온도');
    $('#long_6').html('미기후 항목별 변화 추이');
}
