


function EnglishLanguage() {}

EnglishLanguage.prototype.shortMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
EnglishLanguage.prototype.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
EnglishLanguage.prototype.week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

EnglishLanguage.prototype.temperature = 'Temperature';
EnglishLanguage.prototype.humidity = 'Humidity';
EnglishLanguage.prototype.illumination = 'Illumination';
EnglishLanguage.prototype.carbonDioxide = 'CO₂';
EnglishLanguage.prototype.ph = 'PH';
EnglishLanguage.prototype.ec = 'EC';
EnglishLanguage.prototype.soilTemperature = 'Soil Temperature';
EnglishLanguage.prototype.dewPoint = 'Dew Point';
EnglishLanguage.prototype.humidityDeficit = 'Humidity Deficit(HD)';
EnglishLanguage.prototype.vapourPressureDeficit = 'Vapour-Pressure Deficit(VPD)';

//제품 등록 창
EnglishLanguage.prototype.newSensorActivation = 'New Sensor Activation';
EnglishLanguage.prototype.microClimateSensor = 'Micro-Climate Sensor';
EnglishLanguage.prototype.soilMoistureSensor = 'Soil Moisture Sensor';
EnglishLanguage.prototype.latitude = 'Latitude';
EnglishLanguage.prototype.longitude = 'Longitude';
EnglishLanguage.prototype.submit = 'Submit';

EnglishLanguage.prototype.msg_nullTitleError = 'Please fill in the title.';
EnglishLanguage.prototype.msg_nullSensorSerialError = 'The serial number of one of the sensors must be entered.';
EnglishLanguage.prototype.msg_microClimateSensorError = 'The Micro-Climate Sensor serial number is not valid.';
EnglishLanguage.prototype.msg_soilMoistureSensorError = 'The Soil Moisture Sensor serial number is not valid.';
EnglishLanguage.prototype.msg_sensorSerialError = 'The serial number is not valid.';
EnglishLanguage.prototype.msg_sensorActivation = 'Sensor Activation is completed.';

/******common.js*******/
    //위치 표시
    EnglishLanguage.prototype.common_map_title = 'Title';
    EnglishLanguage.prototype.common_map_serial = 'Serial';
    EnglishLanguage.prototype.common_map_delete = 'Delete';
    EnglishLanguage.prototype.msg_failure = 'sensor value loading failure';
    EnglishLanguage.prototype.msg_unactivateSensor = 'Are you sure you want to unactivate this sensor?';

    //최적 표시 그래프
    EnglishLanguage.prototype.growableMaxTemperature = 'Growable Maximum Temperature';
    EnglishLanguage.prototype.idealTemperature = 'Ideal Temperature';
    EnglishLanguage.prototype.growableMinTemperature = 'Growable Minimum Temperature';
    EnglishLanguage.prototype.idealVPD = 'Ideal VPD';
    EnglishLanguage.prototype.idealHD = 'Ideal HD';

    //HD&VPD 통계
    EnglishLanguage.prototype.veryLow = 'Very Low';
    EnglishLanguage.prototype.low = 'Low';
    EnglishLanguage.prototype.ideal = 'Ideal';
    EnglishLanguage.prototype.high = 'High';
    EnglishLanguage.prototype.veryHigh = 'Very High';




/******index.js*******/
EnglishLanguage.prototype.realTimeData = 'Real-Time Data';

EnglishLanguage.prototype.east = 'E';
EnglishLanguage.prototype.west = 'W';
EnglishLanguage.prototype.north = 'N';
EnglishLanguage.prototype.sourth = 'S';

// 수정요
EnglishLanguage.prototype.no = 'Can not be used';

EnglishLanguage.prototype.controlSolution1 = "<h3 style='display:inline; color:#33ccff'>Humidification</h3> is required</br>at the current temperature.";
EnglishLanguage.prototype.controlSolution2 = "It is the best environment for crop growth.";
EnglishLanguage.prototype.controlSolution3 = "<h3 style='display:inline; color:#ff9933'>Dehumidification</h3> is required</br>at the current temperature.";

EnglishLanguage.prototype.humid = 'Humid';
EnglishLanguage.prototype.dry = 'Dry';




/*****journal.js*****/
EnglishLanguage.prototype.log = 'Log';   //일지



/*****weight.js*****/
EnglishLanguage.prototype.times = 'times';   //횟수
EnglishLanguage.prototype.unimplement = '(To be implemented)';
EnglishLanguage.prototype.channelWeight = 'Channel Weight';
EnglishLanguage.prototype.amountOfDrainage = 'Amount of Drainage';
EnglishLanguage.prototype.scale = 'Scale';   //배액 저울 변화




///////Ejs///////
EnglishLanguage.prototype.setEjs = function() {
    $('#language_en').html('English(US)');
    $('#language_ko').html('한국어');

    $('#tab-sensor').html('Sensor Activation');
    $('#tab-climate').html('Micro-Climate');
    $('#tab-weight').html('Soil Moisture');
    $('#tab-journal').html('Farming Daily Log');
    //$생육 정보
    $('#tab-logout').html('Log Out');

    $('#sensorActiveLabel').html('Please select where the product will be placed.');

    $('#img_zoomIn').html('Zoom IN');
    $('#img_zoomOut').html('Zoom OUT');
    $('#img_reset').html('Reset');
    $('#img_close').html('Close');
}

EnglishLanguage.prototype.setIndexEjs = function() {
    EnglishLanguage.prototype.setEjs();

    $('#titleText').html('Micro-Climate Information');

    $('#left_1').html('Installation Location');
    $('#left_2').html('Weather and Forecast');
    $('#left_3').html('Daily VPD&HD Suitability');

    $('#right_1').html('Real-Time Crop Image');
    $('#right_2').html('')
        $('#right_2_1').html('Temperature')
        $('#right_2_2').html('Humidity')
        $('#right_2_3').html('Illumination')
        $('#right_2_4').html('EC')
        $('#right_2_5').html('PH')
        $('#right_2_6').html('CO2')
        $('#right_2_7').html('Soil Temperature')
    $('#right_3').html('Temperature & Humidity Control Information')
        $('#right_3_1').html('Wet-Bulb Temperature')
        $('#right_3_2').html('Dew Point')
        $('#right_3_3').html('Humidity Deficit(HD)')
        $('#right_3_4').html('Vapour-Pressure Deficit(VPD)')
    $('#right_4').html('Humidity Control Guide') //
        $('#right_4_1').html('Humidity Condition') //
        $('#right_4_2').html('to the Current Values')
        $('#right_4_3').html('(Ideal 3~8 g/m³)')
        $('#right_4_4').html('(Ideal 0.5~1.2 kPa)')

    $('#long_1').html('Daily Variation Chart(Combined)')
    $('#long_2').html('Daily Variation Chart(Dew Point, HD, VPD etc)')
    $('#long_3').html('Daily Variation Chart(VPD & HD Suitability)') //
    $('#long_4').html('Daily Temperature Chart') //
    $('#long_5').html('Daily Variation Chart')
}

EnglishLanguage.prototype.setWeightEjs = function() {
    EnglishLanguage.prototype.setEjs();

    $('#titleText').html('Soil Moisture Information');

    $('#left_1').html('Select Date');
    $('#left_2').html('Installation Locations');

    $('#right_1').html('Real-Time Data')
        $('#right_1_1').html('Channel Weight')
        $('#right_1_2').html('Amount of Drainage')
    $('#right_2').html('Real-Time Nutrient Solution Supply Information')
        $('#right_2_1').html('The Number of Nutrient Solution Supply')
        $('#right_2_2').html('Nutrient Solution Supply Time')
        $('#right_2_3').html('Total Amount of Nutrient Solution Supply')
        $('#right_2_4').html('Total Amount of Drainage')
        $('#right_2_5').html('Crop Fresh Weight<br/>(predictive value)')
        $('#right_2_6').html('Evapotranspiration<br/>(predictive value)')
    $('#right_3').html('Weather and Forecast');

    $('#long_1').html('Daily Variation Chart(Combined)')
        $('#long_1_1').html('[Data Download]')
            $('#long_1_1_1').html('Please Set Date Range for Download');
            $('#long_1_1_2').html('Start Date');
            $('#long_1_1_3').html('End Date');
            $('#downloadDataButton').html('Download');
    $('#long_2').html('Daily Chage Chart');
}

EnglishLanguage.prototype.setJournalEjs = function() {
    EnglishLanguage.prototype.setEjs();

    $('#titleText').html('Farming Daily Log');

    $('#DailyTemperatureLabel').html('Average Daily Temperature in Greenhouse');
    $('#DailyHumidityLabel').html('Average Daily Humidity in Greenhouse');

    $('#left_1').html('Select Date');
    $('#left_2').html('Installation Locations');

    $('#right_1').html('Record')
        $('#right_1_1').html('Save')
        $('#right_1_2').html('Cultivation Situation')
        $('#right_1_3').html('Relevant Facts')
    $('#right_2').html('Weather')
    $('#right_3').html('Daily VPD&HD Suitability');

    $('#long_1').html('Crop Growth Images')
        $('#long_1_1').html('Crop Growth Images Ⅰ')
        $('#long_1_2').html('Crop Growth Images Ⅱ')
    $('#long_2').html('Daily Variation Chart(Combined)');
        $('#long_2_1').html('[Data Download]')
            $('#long_2_1_1').html('Please Set Date Range for Download');
            $('#long_2_1_2').html('Start Date');
            $('#long_2_1_3').html('End Date');
            $('#downloadDataButton').html('Download');
    $('#long_3').html('Daily Variation Chart(Dew Point, HD, VPD etc)');
    $('#long_4').html('Daily Variation Chart(VPD & HD Suitability)');
    $('#long_5').html('Daily Temperature Chart');
    $('#long_6').html('Daily Chage Chart');
}
