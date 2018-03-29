// 카메라 접속 아이디와 비밀번호
var loginuser = 'admin';
var loginpass = '0632551113';

var pri = 0;

//自定义字段
var j=6;
var maluid=0;

var current=0;//当前选中的控件索引
var nDClick=0;//当前双击次数

// 云台方向
//var PTZ_STOP=0;
var PTZ_UP=0;
var PTZ_UP_STOP=1;
var PTZ_DOWN=2;
var PTZ_DOWN_STOP=3;
var PTZ_LEFT=4;
var PTZ_LEFT_STOP=5;
var PTZ_RIGHT=6;
var PTZ_RIGHT_STOP=7;
var PTZ_LEFT_UP=90;
var PTZ_RIGHT_UP=91;
var PTZ_LEFT_DOWN=92;
var PTZ_RIGHT_DOWN=93;
var PTZ_STOP=1;

var PTZ_CENTER=25;
//上下/水平巡视
var PTZ_VPATROL=26;
var PTZ_VPATROL_STOP=27;
var PTZ_HPATROL=28;
var PTZ_HPATROL_STOP=29;

var IO_ON=94;
var IO_OFF=95;

//var PTZ_PREFAB_BIT_SET=13;
//var PTZ_PREFAB_BIT_DEL=14;
//var PTZ_PREFAB_BIT_RUN=15;
var video=new Array();
var n_vpatrol = new Array(); n_vpatrol[0]=n_vpatrol[1]=n_vpatrol[2]=n_vpatrol[3]=n_vpatrol[4]=n_vpatrol[5]=n_vpatrol[6]=n_vpatrol[7]=n_vpatrol[8]=0;
var n_hpatrol = new Array(); n_hpatrol[0]=n_hpatrol[1]=n_hpatrol[2]=n_hpatrol[3]=n_hpatrol[4]=n_hpatrol[5]=n_hpatrol[6]=n_hpatrol[7]=n_hpatrol[8]=0;
//return cgi-url-----------------------------------------------------------------------------------------------------------
function getHttpHost(cgiUrl)
{
	return (cgiUrl+"?loginuse="+loginuser+"&loginpas="+encodeURIComponent(loginpass));
}
//云台控制-----------------------------------------------------------------------------------------------------------
function ptz_control(command)
{
var url = getHttpHost("decoder_control.cgi");
url+='&command='+command;
url+='&onestep=0';
url+='&' + new Date().getTime() + Math.random();
$.getScript('http://' + cam02_IP + ':' + cam02_Port + '/' +url);
}
function camera_control(param,value)
{
var url = getHttpHost("camera_control.cgi");
url+='&param='+param+'&value='+value;
url+='&' + new Date().getTime() + Math.random();
//alert(url);
$.getScript(url);
  if(param==15){
	  if(value==0){//次码流
		  maluid=0;
		  j=12;
		  }else if(value==2){//主码流
			  maluid=2;
			  j=6;
			  }else if(value==1){//第三码流
				  maluid=1;
				  j=17;
				  }
  }
}
//云台控制-----------------------------------------------------------------------------------------------------------
function ptz_onmousedown(i)
{
	if(pri==1)
		return 0;
	if(i == 0 ) {ptz_control(PTZ_UP);}
	if(i == 1 ) {ptz_control(PTZ_LEFT_UP);}
	if(i == 2 ) {ptz_control(PTZ_RIGHT_UP);}
	if(i == 3 ) {ptz_control(PTZ_LEFT);}
	if(i == 4 ) {ptz_control(PTZ_CENTER);}
	if(i == 5 ) {ptz_control(PTZ_RIGHT);}
	if(i == 6 ) {ptz_control(PTZ_LEFT_DOWN);}
	if(i == 7 ) {ptz_control(PTZ_DOWN);}
	if(i == 8 ) {ptz_control(PTZ_RIGHT_DOWN);}
	//开关闭合
	if(i == 13 ) {ptz_control(IO_OFF);}
	if(i == 14 ) {ptz_control(IO_ON);}
	//
	if(i == 9 ) {
	if(n_vpatrol[current] == 0){	n_vpatrol[current] = 1; ptz_control(PTZ_VPATROL);}
	else{				n_vpatrol[current] = 0; ptz_control(PTZ_VPATROL_STOP);}
	}
	if(i == 11 ) {
	if(n_hpatrol[current] == 0){	n_hpatrol[current] = 1;ptz_control(PTZ_HPATROL);}
	else{				n_hpatrol[current] = 0; ptz_control(PTZ_HPATROL_STOP);}
	}
}
function ptz_onmouseup(i)
{
	if(pri==1)
		return 0;
	if(i == 0 ) {ptz_control(PTZ_UP_STOP);}
	if(i == 1 ) {ptz_control(PTZ_STOP);}
	if(i == 2 ) {ptz_control(PTZ_STOP);}
	if(i == 3 ) {ptz_control(PTZ_LEFT_STOP);}
	//if(i == 4 ) {ptz_control(PTZ_STOP);}
	if(i == 5 ) {ptz_control(PTZ_RIGHT_STOP);}
	if(i == 6 ) {ptz_control(PTZ_STOP);}
	if(i == 7 ) {ptz_control(PTZ_DOWN_STOP);}
	if(i == 8 ) {ptz_control(PTZ_STOP);}
	//开关闭合
	if(i == 13 ) {$("#switchoff").attr("src","images/switchoff_up.gif");}
	if(i == 14 ) {$("#switchon").attr("src","images/switchon_up.gif");}
}
//翻转-----------------------------------------------------------------------------------------------------------
var n_reversal =new Array();
n_reversal[0]=n_reversal[1]=n_reversal[2]=n_reversal[3]=n_reversal[4]=n_reversal[5]=n_reversal[6]=n_reversal[7]=n_reversal[8]=0;
var n_mirror =new Array();
n_mirror[0]=n_mirror[1]=n_mirror[2]=n_mirror[3]=n_mirror[4]=n_mirror[5]=n_mirror[6]=n_mirror[7]=n_mirror[8]=0;
function set_flip(img)
{
	if(pri==1) return 0;
	if(img.indexOf("img_reversal")!= -1)
	{
		$("#img_reversal").attr("src",(n_reversal[current] == 0)?"images/reversal_on.gif":"images/reversal.gif");
		(n_reversal[current] == 0)?n_reversal[current]=1:n_reversal[current]=0;
	}

	if(img.indexOf("img_mirror")!= -1)
	{
		$("#img_mirror").attr("src",(n_mirror[current] == 0)?"images/mirror_on.gif":"images/mirror.gif");
		(n_mirror[current] == 0)?n_mirror[current]=1:n_mirror[current]=0;
	}

	var value1;
	if ( (n_reversal[current]==1) && (n_mirror[current]==1)){
		value1 = 3;
	}
	else if (n_reversal[current]==1){
		value1 = 1;
	}
	else if (n_mirror[current]==1){
		value1 = 2;
	}
	else{
		value1 = 0;
	}
	camera_control(5, value1);
}

function getX(elem){
var x = 0;
while(elem){
  x = x + elem.offsetLeft;
  elem = elem.offsetParent;
}
return x;
}
function getY(elem){
var y = 0;
while(elem){
  y = y + elem.offsetTop;
  elem = elem.offsetParent;
}
return y;
}
function setspeed(nValue){
var n=nValue*2;
var url = getHttpHost("set_misc.cgi");
url=url+'&ptz_patrol_rate='+n
	+'&ptz_patrol_up_rate='+n+'&ptz_patrol_down_rate='+n+'&ptz_patrol_left_rate='+n
	+'&ptz_patrol_right_rate='+n;
$.getScript(url);
ShowCurPos(nValue);
}
function ShowCurPos(nValue)
{
	document.getElementById('curpos').innerHTML = "<span class='cs2' id='curpos' onMouseDown='showpostable();' onMouseOver='showhint(_set_ptz_speed)' onMouseOut='showhint('')'>"+nValue+"</span>";
}
function showpostable(){
hidep();
var tb=document.getElementById('pt');
var curpos=document.getElementById('curpos');
var nleft=getX(curpos);
var ntop=getY(curpos);
tb.style.left=nleft+5;
tb.style.top=ntop+26;
tb.style.display = "block";
}

//预置位-----------------------------------------------------------------------------------------------------------
function showppos(panel,btn)
{
	if(pri == 1)
		return;

	hidep();
	var left = $("#"+btn).offset().left;//元素相当于窗口的左边的偏移量
	var top = $("#"+btn).offset().top;//元素相对于窗口的上边的偏移量
	$( "#"+panel ).css("left",left+5);
	$( "#"+panel ).css("top",top+20);
	$( "#"+panel ).show();
}
function hideppos(panel)
{
	$( "#"+panel ).hide();
}
function hidep(){
	$( "#cp" ).hide();
	$( "#sp" ).hide();
	$( "#pt" ).hide();
	$( "#ptColor" ).hide();
}
function callpos(cmd){
var url = getHttpHost("decoder_control.cgi");
url+='&command='+cmd;
url+='&onestep=0'+'&sit='+cmd;
url+='&' + new Date().getTime() + Math.random();
$.getScript(url);
hidep();
}
function setpos(cmd){
var url = getHttpHost("decoder_control.cgi");
url+='&command='+cmd;
url+='&onestep=0'+'&sit='+cmd;
url+='&' + new Date().getTime() + Math.random();
$.getScript(url);
hidep();
}

function SetIROnOff()
{
	if(pri == 1) return;
	if(ircut==0)
		ircut=1
	else
		ircut=0;
	camera_control(14,ircut);
	ircontrol.src='images/ir'+ircut+'.gif';
}

//helper fun -- start-----------------------------------------------------------------------------------------------------------
function helper_showParam()
{
	var url = getHttpHost("get_camera_params.cgi");
	url += "&"+(new Date-0);//alert(url);
	$.getScript(url, function(){
		$( "#mode").val(mode);
		if(maluid == 0){
			$( "#vresolution").val(resolutionsub);
			$( "#cbMaxVideoRate").val(sub_enc_framerate);
		  }else if(maluid == 2){
			$( "#vresolution").val(resolution);
			$( "#cbMaxVideoRate").val(enc_framerate);
			}else if(maluid == 1){
				$( "#vresolution").val(resolutionsubsub);
				$( "#cbMaxVideoRate").val(sub_sub_enc_framerate);
				}
		$( "#brightness" ).val(vbright);
		$( "#contrast" ).val( vcontrast)
		$( "#Saturation" ).val( vsaturation)
		$( "#hue" ).val( vhue)

		if(flip==0)
		{
			n_reversal[current] = 0;
			n_mirror[current] = 0;
		}
		else if(flip==2)
		{
			n_reversal[current] = 0;
			n_mirror[current] = 1;
		}
		else if(flip==1)
		{
			n_reversal[current] = 1;
			n_mirror[current] = 0;
		}
		else if(flip==3)
		{
			n_reversal[current] = 1;
			n_mirror[current] = 1;
		}

		$("#img_reversal").attr("src",(n_reversal[current] == 1)?"images/reversal_on.gif":"images/reversal.gif");
		$("#img_mirror").attr("src",(n_mirror[current] == 1)?"images/mirror_on.gif":"images/mirror.gif");
	});

}
//焦点控件改变-----------------------------------------------------------------------------------------------------------
function helper_ChangeFocus(index)
{
	current = index;
	//还原图标状态
	$("#vpatrol").attr("src",(n_vpatrol[current] == 0)?"images/vpatrol_up.gif":"images/vpatrol_down.gif");
	$("#hpatrol").attr("src",(n_hpatrol[current] == 0)?"images/hpatrol_up.gif":"images/hpatrol_down.gif");

	$("#img_reversal").attr("src",(n_reversal[current] == 0)?"images/reversal.gif":"images/reversal_on.gif");
	$("#img_mirror").attr("src",(n_mirror[current] == 0)?"images/mirror.gif":"images/mirror_on.gif");

	//还原数据
	helper_showParam();
}

//屏幕分割-----------------------------------------------------------------------------------------------------------
var n_x = 0;
function x_onclick(index,bSave)
{
	n_x = index;
	for (i=0;i<9;i++)
	{
		if(i>=n_x){
			video[i].style.width=0;
			video[i].style.height=0;
		}
	}
	$("#x1").attr("src","images/x1_off.gif");
	$("#x4").attr("src","images/x4_off.gif");
	$("#x9").attr("src","images/x9_off.gif");

	setTimeout('x_onclick_ex()',100);
	if(bSave)
		setcookie('split',n_x,720);
}
function x_onclick_ex()
{
	if (n_x == 1){
		helper_ChangeFocus(0);
		if(maluid == 0)
		{
			video[0].style.width=640;
			video[0].style.height=360;
			nWidth = 640;
		}
		else if(maluid == 2)
		{
			video[0].style.width=960;
			video[0].style.height=540;
			nWidth = 960;
		}
		else if(maluid == 1)
		{
			video[0].style.width=320;
			video[0].style.height=180;
			nWidth = 320;
		}
		$("#x1").attr("src","images/x1_on.gif");
	}
	else if(n_x == 4){
		for (i=0;i<4;++i){
			video[i].style.width= 320;
			video[i].style.height=240;
		}
		$("#x4").attr("src","images/x4_on.gif");
		nWidth = 640;
	}
	else{
		for (i=0;i<9;++i){
			video[i].style.width= 213;
			video[i].style.height=160;
		}
		$("#x9").attr("src","images/x9_on.gif");
		nWidth = 639;
	}
	document.getElementById("ipcamdiv").style.width=nWidth;
}

function PlayVideo(n)
{
	switch(n){
	case 0:
		video[n].src="http://"+location.hostname+":"+port+"/videostream.cgi?user="+loginuser+"&pwd="+loginpass;
		break;
	case 1:
		video[n].src="http://"+dev2_host+":"+dev2_port+"/videostream.cgi?user="+dev2_user+"&pwd="+dev2_pwd;
		break;
	case 2:
		video[n].src="http://"+dev3_host+":"+dev3_port+"/videostream.cgi?user="+dev3_user+"&pwd="+dev3_pwd;
		break;
	case 3:
		video[n].src="http://"+dev4_host+":"+dev4_port+"/videostream.cgi?user="+dev4_user+"&pwd="+dev4_pwd;
		break;
	case 4:
		video[n].src="http://"+dev5_host+":"+dev5_port+"/videostream.cgi?user="+dev5_user+"&pwd="+dev5_pwd;
		break;
	case 5:
		video[n].src="http://"+dev6_host+":"+dev6_port+"/videostream.cgi?user="+dev6_user+"&pwd="+dev6_pwd;
		break;
	case 6:
		video[n].src="http://"+dev7_host+":"+dev7_port+"/videostream.cgi?user="+dev7_user+"&pwd="+dev7_pwd;
		break;
	case 7:
		video[n].src="http://"+dev8_host+":"+dev8_port+"/videostream.cgi?user="+dev8_user+"&pwd="+dev8_pwd;
		break;
	case 8:
		video[n].src="http://"+dev9_host+":"+dev9_port+"/videostream.cgi?user="+dev9_user+"&pwd="+dev9_pwd;
		break;
	}
}

function StopVideo(n)
{
	video[n].src="";
}

function body_onload()
{
	if(pri == 1)
	{disableCtls(true);}

	video[0]=document.getElementById("videoC");
	video[1]=document.getElementById("videoC1");
	video[2]=document.getElementById("videoC2");
	video[3]=document.getElementById("videoC3");
	video[4]=document.getElementById("videoC4");
	video[5]=document.getElementById("videoC5");
	video[6]=document.getElementById("videoC6");
	video[7]=document.getElementById("videoC7");
	video[8]=document.getElementById("videoC8");
	video[9]=document.getElementById("videoC9");

	helper_showParam();
	var imgsrc = "videostream.cgi?loginuse="+loginuser+"&loginpas="+encodeURIComponent(loginpass);
	$("#ipcamdiv").attr("src",imgsrc);
	camera_control(15,maluid);

	$("#ircontrol").attr("src",'images/ir'+ircut+'.gif');

	$("#cbMaxVideoRate").empty();
	for(var x=25;x>0;x--)
	{
	$("#cbMaxVideoRate").append("<option value='"+x+"'>"+x+"</option>");
	}
	$( "#cbMaxVideoRate").val(enc_framerate);
	nsplit=getcookie("split");
	if(nsplit !=1 && nsplit!=4 && nsplit != 9)
		nsplit=1;

	x_onclick(nsplit,false);
	$("#videoStyle").val(2);

	var i = PlayVideo(0);

	if(dev2_host != '') { PlayVideo(1);}
	if(dev3_host != '') {  PlayVideo(2);}
	if(dev4_host != '') {  PlayVideo(3);}
	if(dev5_host != '') {  PlayVideo(4);}
	if(dev6_host != '') {  PlayVideo(5);}
	if(dev7_host != '') {  PlayVideo(6);}
	if(dev8_host != '') {  PlayVideo(7);}
	if(dev9_host != '') {  PlayVideo(8);}

	if(typeof ptz_patrol_rate != 'undefined')
		ShowCurPos(ptz_patrol_rate/2);
	changeSize();
}
function disableCtls(bCanPtz)
{
	$("#mode").attr("disabled",bCanPtz);
	$("#vresolution").attr("disabled",bCanPtz);
	$("#bitrate").attr("disabled",bCanPtz);
	$("#cbMaxVideoRate").attr("disabled",bCanPtz);
	$("#brightness").attr("disabled",bCanPtz);
	$("#contrast").attr("disabled",bCanPtz);
	$("#Saturation").attr("disabled",bCanPtz);
	$("#hue").attr("disabled",bCanPtz);
}

function snapshotPic()
{
	if(pri == 1) return;
	window.open("snapshot.htm");
}
function settingurl()
{
	if(pri != 255) return;
	location="admin2.htm";
}
function changeRes()
{
	var url = getHttpHost("get_camera_params.cgi");
	url += "&"+(new Date-0);//alert(url);
	$.getScript(url, function(){
	  changeSize();
	  if(n_x == 1)
			x_onclick(n_x,false);
			PlayVideo(0);
	});
}

function requestvideo()
{
	var append = '&'+new Date().getTime()+Math.random();
	var imgsrc = "videostream.cgi?loginuse="+loginuser+"&loginpas="+encodeURIComponent(loginpass)+append;
	$("#ipcamdiv").attr("src",imgsrc);
	}
function changeSize()
{
	if(maluid == 0){
		$("#ipcamdiv").attr("width",640);
		$("#ipcamdiv").attr("height",360);
		$("#cbMaxVideoRate").val(sub_enc_framerate);
		}else if(maluid == 1){
			$("#ipcamdiv").attr("width",320);
			$("#ipcamdiv").attr("height",180);
			$("#cbMaxVideoRate").val(sub_sub_enc_framerate);
		   }else if(maluid == 2){
			$("#ipcamdiv").attr("width",960);
			$("#ipcamdiv").attr("height",540);
			$("#cbMaxVideoRate").val(enc_framerate);
			}else{
		}
	}
//设置背景颜色
function SetCpBackColor(obj, n)
{
	//鼠标在范围内时变色，否则无色
	if(n == 0){
		obj.bgColor = '';
	}else{
		obj.bgColor = '#ffff00';
	}
}
function showhint(str){
document.getElementById("hint_span").innerHTML="<span class='style2' id='hint_span'>"+str+"</span>";
}

var s_CurColor="";
function ShowptColor(btn,nCur,nDef)
{
	if(pri == 1)
		return;
	hidep();
	for(var i=0;i<35;i++){
		$("#ptColorSpan"+i).css("color","#17659e");
		$("#ptColorSpan"+i).css("font-weight","normal");
	}
	$("#ptColorSpan"+nDef).css("color","red");
	$("#ptColorSpan"+parseInt(nCur/7)).css("color","yellow");
	$("#ptColorSpan"+parseInt(nCur/7)).css("font-weight","bold");

	var left = $("#"+btn).offset().left;//元素相当于窗口的左边的偏移量
	var top = $("#"+btn).offset().top;//元素相对于窗口的上边的偏移量
	$("#ptColor").css("left",left+5);
	$("#ptColor").css("top",top+26);
	$("#ptColor").show();
	s_CurColor=btn;
}

function setColor(nValue)
{
	if(s_CurColor=="clr_bright"){
		camera_control(1,nValue*7);
		vbright=nValue*7;
	}
	else if(s_CurColor=="clr_contast"){
		camera_control(2,nValue*7);
		vcontrast=nValue*7;
	}
	else if(s_CurColor=="clr_saturation"){
		camera_control(8,nValue*7);
		vsaturation=nValue*7;
	}
	else if(s_CurColor=="clr_hue"){
		camera_control(9,nValue*7);
		vhue=nValue*7;
	}
}
