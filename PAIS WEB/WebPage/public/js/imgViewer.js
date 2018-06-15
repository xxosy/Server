var selectedSensor= getCookie(cookie_recentSensor);



function setDatas(isSerialCheck) {

    if (isSerialCheck == true)  addSelectElement();

    setCamURL()



    let goFS = document.getElementById("fullscreen");

    goFS.addEventListener("click", function() {

        let isFullscreen = document.webkitIsFullScreen;

        if (isFullscreen == false) {

            let container = document.getElementById("playerWrapper");

            container.webkitRequestFullscreen();

        } else {

            document.webkitExitFullscreen();

        }

    });



    $("#start-date-form").datetimepicker({

        format: 'YYYY-MM-DD',

    });

    $('#end-date-form').datetimepicker({

        format: 'YYYY-MM-DD',

        useCurrent: false //Important! See issue #1075

    });



    $('#start-date-form').data("DateTimePicker").maxDate(new Date());

    $('#end-date-form').data("DateTimePicker").maxDate(new Date());



    $("#start-date-form").on("dp.change", function (e) {

        $('#end-date-form').data("DateTimePicker").minDate(e.date);

    });



    $("#end-date-form").on("dp.change", function (e) {

        $('#start-date-form').data("DateTimePicker").maxDate(e.date);

    });



    let date = new Date();

    let today = dateFormatConvert(date.getFullYear(), date.getMonth()+1, date.getDate());

    loadVideoImg(today, today);

    setDate(today, today);

    showImageOnMain(0, 0, 'cam01', today);

    dateImgSelect(today);

}



function dateFormatConvert(fullYear, month, date) {

    if (month < 10) {

        month = "0" + month;

    }

    if(date < 10) {

        date = "0" + date;

    }



    return fullYear + '-' + month + '-' + date;

}



//해당하는 카메라 이미지 주소 리턴

//type : crop, bug 두타입으로 나뉨

//date : 언제 카메라 영상인지

//time : 몇시 카메라 영상인지

var cam01_IP;

var cam01_Port;

var cam02_IP;

var cam02_Port;



function setCamURL() {
    let signature = createhmac(selectedSensor);

    $.ajax({

        url: myServerIP + ":" + sensorServerPort + "/camera/list/sensor/" + selectedSensor,

        type: "GET",

        dataType: "json",
        headers: { 'x-signature' : signature },

        success: function(response) {



            if (response.status != 'fail') {

                var res_datas = response.data;



                cam01_IP = response.data[(res_datas.length - 2)].ip.split(":")[1].split("//")[1];

                cam01_Port =  response.data[(res_datas.length - 2)].http_port;



                cam02_Port = response.data[(res_datas.length - 1)].http_port;

                cam02_IP = response.data[(res_datas.length - 1)].ip.split(":")[1].split("//")[1];

            }

        },

        error: function(response, status, error) {}

    });

}



function getCamImageSrc(type, date, time) {

    var imgRootPath = "img/camera";

    var folderDir = imgRootPath + "/" + date + "/";



    if (type == "cam01")

        folderDir += cam01_IP + "_" + cam01_Port + "/";

    else if (type == "cam02")

        folderDir += cam02_IP + "_" + cam02_Port + "/";



    if (time < 10)

        time = '0' + time;



    return folderDir + time + '.png';

}



function loadVideoImg(startDate, endDate) {

    var template = "";

          template += '<img-list id="img-list-index"onclick="showImageOnMain(img-index, img-num, \'cam01\', img-date)" data-date=img-date>';

          template +=     '<div class="selected-date-contents"><img width=220px src="img-src" style="display:block; margin-bottom:0;"/></div>';

          template +=     '<div>img-string</div>';

          template += '</img-list>';



    var start = moment(startDate);

    var end = moment(endDate);



    var items = "";

    var diff = end.diff(start, 'days');



    var query = "/camera/list/sensor/";

    let signature = createhmac(selectedSensor);
    $.ajax({

        dataType: "json",

        url: myServerIP + ':' + sensorServerPort + query + selectedSensor,

        type: "GET",
        headers: { 'x-signature' : signature },
        async: false,

        success: function(res) {

            var img_index = 0;

            var firstImg = true;

            for (var i = 0; i <= diff; i++) {

                var img_src = "img/noImage.png";

                var num, time;

                $.ajaxSettings.async = false;

                for (var j = 0; j < 12; j++) {

                    num = j * 2;

                    if (num < 10) { num = '0' + num; }

                    time = num + ':00';

                    $.get(myServerIP + '/img/camera/' + start.format('YYYY[-]MM[-]DD') + '/' + res.data[0].url.split('//')[1].split(':')[0] + '_' + res.data[0].http_port + '/' + num + '.png')

                    .done(function() {

                        img_src = 'img/camera/' + start.format('YYYY[-]MM[-]DD') + '/' + res.data[0].url.split('//')[1].split(':')[0] + '_' + res.data[0].http_port + '/' + num + '.png';

                        if (firstImg) {

                            showImageOnMain(img_index,  j, 'cam01',  start.format('YYYY[-]MM[-]DD'));

                            firstImg = false;

                        }

                    })

                    .fail(function() {

                        img_src = "img/noImage.png";

                    });

                    items += template.replace('img-list-index', 'img-list-' + img_index).replace('img-index', img_index++).replace('img-num', j).replace('img-src', img_src).replace(/img-date/g, '\'' + start.format('YYYY[-]MM[-]DD') + '\'').replace('img-string', start.format('YYYY[-]MM[-]DD') + '<br>' + time);

                }

                $.ajaxSettings.async = true;

                start.add(1, 'days');

            }

        },

        error: function(response, status, error) {}

    });

    $('#img-items').html(items);

}



//메인 이미지 출력

//num : 몇번째 이미지를 눌렀는지

//type : 어떤 카메라의 이미지를 눌렀는지

//date : 날짜

var selectedCamImgNum;  //팝업 창에 보여지고 있는 이미지의 번호가 저장될 변수

var selectedCamType;



function showImageOnMain(index, num, type, date) {

    if (type == "") { type = "cam01"; }

    selectedCamImgNum = index;

    selectedCamType = type;

    $('#imgDetail').attr("src", getCamImageSrc(type, date, num * 2));

}



function clickNextCamImg() {

    let targetImg = selectedCamImgNum + 1; //[추후]저장되는 이미지의 이름 형식에 맞게 변형을 해야됨

    let imgObject = $('#img-list-'+ targetImg + ' img');



    if (imgObject.length == 0) {  // 마지막 이미지

        if ($(".btn-play").attr('aria-label') == 'pause') { // 재생 상태일 때

          changePlayBtn();

          alert("재생 끝");

        }

        else alert("끝");



        return;

    }



    if (imgObject.attr('src') == 'img/noImage.png') {

        selectedCamImgNum++;

        clickNextCamImg();

        return;

    }



    if ($('#img-list-' + targetImg).length) {

        $('#img-list-' + targetImg).click();

    }

}



function clickPreCamImg() {

    let targetImg = selectedCamImgNum - 1;

    let imgObject = $('#img-list-'+ targetImg + ' img');



    if (imgObject.length == 0) {

        alert("처음 이미지입니다.");

        return;

    }



    if (imgObject.attr('src') == 'img/noImage.png') {

        selectedCamImgNum--;

        clickPreCamImg();

        return;

    }



    if ($('#img-list-' + targetImg).length) {

        $('#img-list-' + targetImg).click();

    }

}



function changeCamImg(imgNum) {

    $('#imgDetail').attr("src", getCamImageSrc(selectedCamType, $('#start-date-form').val(), imgNum * 2));

    selectedCamImgNum = imgNum;

}



function addSelectElement() {

    var template = '<option value="element_value">element_text</option>';

    var options = "<option value='' selected disabled hidden>Choose here</option>";

    var serials  = getSerialList();

    for (var i = 0; i < Object.keys(serials).length; i++) {

        options += template.replace('element_value', Object.keys(serials)[i]).replace('element_text', serials[Object.keys(serials)[i]]);

    }

     $('#serialSelect').html(options);

     $('#serialSelect').val(getCookie(cookie_recentSensor));

}



function getSerialList() {

  var serialList = {};

  var url = myServerIP + ":" + sensorServerPort + "/usersensor/sensors/";
  let usercode = getCookie(cookie_usercode);
  let signature = createhmac(usercode);
  $.ajax({

      dataType: "json",
      url: url,
      type: "GET",
      headers:{"x-signature":signature, "Authorization" : usercode},
      async: false,

      success: function(response) {

          var countSensor = 0;

          var countWeight = 0;

          if(response.statecode === 200){

              var response_data = response.data;

              for (i = 0; i < response_data.length; i++) {

                  if (response_data[i].serial != null && response_data[i].serial != "-") {

                      serialList[response_data[i].serial] = response_data[i].title;

                  }

              }

          }

      },

      error: function(response, status, error) {

          console.log("sensor loading failure : " + status + ", " + error);

          showAddDevice();

      }

  });



  return serialList;

}



function serialSelect() {

    selectedSensor = document.getElementById("serialSelect").value;

    setCookie(cookie_recentSensor, document.getElementById("serialSelect").value, 30);

    setCamURL();

}



function changePlayBtn() {

    var btnState = $(".btn-play").attr('aria-label');

    if (btnState == 'play') {

        slideControl('play');

        $(".btn-play").attr('aria-label', 'pause');

    } else {

        slideControl('pause');

        $(".btn-play").attr('aria-label', 'play');

    }

}



var slideIntervalId;

function slideControl(playState) {

    if (playState == 'play') {

        slideIntervalId = setInterval( function() {

            clickNextCamImg();

        }, 1000);

    } else {

        clearInterval(slideIntervalId);

    }

}



function setDate(startDate, endDate) {

  // http://www.ezsmartfarm.com:3000/camera/list/sensor/PUB3397



    var template =''

    template += '<grid-video-renderer class="img-vdeo-list" style="margin-right:4px; display:flex; margin-bottom:7px; flex-direction:column; color:white" onclick="dateImgSelect(img-date)">';

    template +=     '<div style="margin-right:4px; height:128px">';

    template +=         '<img-thumbail>';

    template +=             '<div style="display:flex; width:220px; height:128px;"><img width=220px src="img-video-src" style="display:block; margin-bottom:0;"/></div>';

    template +=             '<div class="overlay" style="margin:0; padding:0; border:0; background:transparent;">';

    template +=                 '<overlay-side-panel style="width:90px">';

    template +=                     '<overlay-string>img-video-num</overlay-string>';

    template +=                     '<overlay-icon style="margin:4px 0 0;width:24px; height:14px">';

    template +=                         '<svg viewBox="0 0 24 24" style="stroke:white;fill:white;"><path d="M32.909,24.472c0-5.621-4.535-10.181-10.129-10.181c-5.594,0-10.127,4.56-10.127,10.181S17.186,34.65,22.78,34.65   C28.374,34.65,32.909,30.094,32.909,24.472 M9.717,87.969c0,0-0.098,0.134-0.239,0.354h120.996   c-0.011-0.013-0.019-0.021-0.027-0.037L89.151,32.069c0,0-4.896-6.664-9.789,0L53.807,66.86l-9.4-12.805c0,0-4.895-6.662-9.787,0   L9.717,87.969z M134.567,91.956H5.382V5.409h129.186V91.956L134.567,91.956zM139.951,94.66V2.705c0-1.494-1.205-2.705-2.69-2.705   H2.692C1.206,0,0,1.211,0,2.705V94.66c0,1.494,1.205,2.705,2.691,2.705h134.57C138.746,97.365,139.951,96.154,139.951,94.66" transform="matrix(0.14182454,0,0,0.14182454,2,0)"></path></svg>'

    template +=                     '</overlay-icon>'

    template +=                 '</overlay-side-panel>';

    template +=             '</div>';

    template +=         '</img-thumbail>';

    template +=     '</div>';

    template +=     '<div style="flex:1;">img-video-date</div>';

    template += '</grid-video-renderer>';



    var items = "";

    var representativeImg;



    var start = moment(startDate);

    var end = moment(endDate);



    var count = 0;

    var query = "/camera/list/sensor/"

    $.ajax({

        dataType: "json",

        url: myServerIP + ':' + sensorServerPort + query + selectedSensor,

        type: "GET",

        async: false,

        success: function(res) {

            var diff = end.diff(start, 'days');

            for (var i = 0; i <= diff; i++) {

                var isFirst = true;

                count = 0;

                representativeImg = 'img/noImage.png';

                $.ajaxSettings.async = false;

                for (var j = 0; j < 24; j++) {

                    var num = j + '';

                    if (j < 10) { num = '0' + num; }

                    $.get(myServerIP + '/img/camera/' + start.format('YYYY[-]MM[-]DD') + '/' + res.data[0].url.split('//')[1].split(':')[0] + '_' + res.data[0].http_port + '/' + num + '.png')

                    .done(function() {

                        count++;

                        if (isFirst) {

                            representativeImg = myServerIP + '/img/camera/' + start.format('YYYY[-]MM[-]DD') + '/' + res.data[0].url.split('//')[1].split(':')[0] + '_' + res.data[0].http_port + '/' + num + '.png';

                            isFirst = false;

                        }

                    })

                    .fail(function() {

                    });

                }

                $.ajaxSettings.async = true;

                items += template.replace('img-video-src', representativeImg).replace('img-video-num', count).replace('img-video-date', start.format('YYYY[-]MM[-]DD')).replace('img-date', '\'' + start.format('YYYY[-]MM[-]DD') + '\'');

                start.add(1, 'days');

            }

        },

        error: function() {



        }

    });



    $('#items').html(items);

    $('#img-date-list').html(items);

}



function dateImgSelect(date) {

  $('#certain-select-items').empty();

    $('[data-date=' + date + ']').each(function() {

        $('#certain-select-items').append($(this).clone());

    });



    $('#img-title').html('작물 생장 이미지(' + date + ')');

    $('#img-items').css('display', 'none');

    $('#img-date-list').css('display', 'none');

    $('#certain-select-items').css('display', 'flex');

}



function dateListOn() {

    $('#img-items').css('display', 'none');

    $('#img-title').html('날짜');

    $('#img-date-list').css('display', 'flex');

    $('#certain-select-items').css('display', 'none');

}



function allImageListOn() {

    $('#img-items').css('display', 'flex');

    $('#img-title').html('작물 생장 이미지(기간전체)');

    $('#img-date-list').css('display', 'none');

    $('#certain-select-items').css('display', 'none');

}



function search() {

    loadVideoImg($('#start-date-form').val(), $('#end-date-form').val());

    setDate($('#start-date-form').val(), $('#end-date-form').val());

    allImageListOn()

}

