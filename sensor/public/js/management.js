var server_address = ''
var sensor_id;
var current_sensor;
var array_sensor = new Array();
var serials;
var refresh_states = new Array();
function setSensorList(){
	sensor_id = new Array();
	serials = new Array();
	$.ajax({
		dataType: "json",
		url: server_address+"/sensor/camera/list/all",
		type: "GET",
		success: function(response){
			drawList(response.data);
			var contents = "";
			for(var i = 0;i<response.data.length;i++){
				array_sensor[i] = response.data[i];
				sensor_id.push(response.data[i].id);
				serials.push(response.data[i].serial);
			}
			setSensorConnectionState();
		},
		error: function(response, status, error){
			console.log(error);
			console.log(response);
			console.log("error");
		}
	});
}

function setSensorConnectionState(){
	for(var i = 0;i<sensor_id.length;i++){
		var sensor_id_temp = sensor_id;
		$.ajax({
			dataType: "json",
			url: server_address+"/value/check/sensor/"+sensor_id[i],
			type: "GET",
			success: function(response){
				var current_date = new Date();
				var HH = current_date.getHours();
				var mm = current_date.getMinutes();
				var dd = current_date.getDate();
				var MM = current_date.getMonth()+1;
				var yy = current_date.getFullYear();
				mm = mm*1-16;
				mm = mm +'';
				var date = yy+'-'+MM+'-'+dd;
				var time = (HH*60)+mm*1;
				var update_date = new Date(response.update_date);
				dd = update_date.getDate();
				MM = update_date.getMonth()+1;
				yy = update_date.getFullYear();
				update_date = yy+'-'+MM+'-'+dd;
				var update_time = response.update_time;
				var sp = update_time.split(':');
				var t = (sp[1]*1)+sp[0]*60;
				if(date === update_date && t>time){
					$('#state_'+response.sensor_id).css("background","#80D651");
				}else{
					$('#state_'+response.sensor_id).css("background","#d73814");
				}
				$('#last_update_'+response.sensor_id).html(update_date+" "+update_time.split('.')[0]);
			},
			error: function(response, status, error){
				// console.log(error);
				// console.log(response);
			}
		});

		// $.ajax({
		// 	dataType:"text",
		// 	url:server_address+"/value/tempIPAddress/"+serials[i],
		// 	async:false,
		// 	type:"GET",
		// 	success: function(response){
		// 		$('#camera_url_'+sensor_id[i]).html(response);
		// 	},
		// 	error: function(response, status, error){
		// 		console.log("error");
		// 	}		
		// });

		// $.ajax({
		// 	dataType:"json",
		// 	url:server_address+"/camera/sensor/"+sensor_id[i],
		// 	async:false,
		// 	type:"GET",
		// 	success: function(response){

		// 		if(response.data[0].url){
		// 			$('#camera_check_'+sensor_id[i]).html(response.data[0].url);
		// 		}else
		// 			$('#camera_check_'+sensor_id[i]).html("-");
		// 	},
		// 	error: function(response, status, error){
		// 		console.log("error");
		// 	}		
		// });
	}
}

function clickSensor(sensor_id,serial){
	current_sensor = sensor_id;
	$('#selected-sensor').text('영점 설정 : ' +serial);
	$('#serial_delete').val(serial);
	if($('#zeropoint_'+sensor_id).css("display")=="none"){
		$('#zeropoint_'+sensor_id).show();
		$.ajax({
			dataType: "json",
			url: server_address+"/zeropoint/id/"+current_sensor,
			type: "GET",
			success: function(response){
				var zeropoint = response[0];
				$('#medium_weight_input_'+sensor_id).val(zeropoint.medium_weight);
				$('#drain_weight_input_'+sensor_id).val(zeropoint.drain_weight);
				$('#ec_input_'+sensor_id).val(zeropoint.ec);
				$('#ph_input_'+sensor_id).val(zeropoint.ph);
				$('#co2_input_'+sensor_id).val(zeropoint.co2);
			},
			error: function(response, status, error){
				console.log("error");
			}
		});

		$.ajax({
			dataType:"text",
			url:server_address+"/value/tempIPAddress/"+serial,
			type:"GET",
			success: function(response){
				$('#sensor_ip_'+current_sensor).val(response);
			},
			error: function(response, status, error){
				console.log("error");
			}		
		});

		$.ajax({
			dataType:"json",
			url:server_address+"/camera/sensor/"+current_sensor,
			type:"GET",
			success: function(response){
				if(response.data[0].url)
					$('#camera_ip_'+current_sensor).val(response.data[0].url);
				else
					$('#camara_ip_'+current_sensor).text("");
			},
			error: function(response, status, error){
				console.log("error");
			}		
		});
		clickReadCurrentValue();
	}else{
		$('#zeropoint_'+sensor_id).hide();
	}
}

function clickReadCurrentValue(){
	$.ajax({
		dataType: "json",
		url: server_address+"/zeropoint/recent/id/"+current_sensor,
		type: "GET",
		success: function(response){
			if(response.status == 'fail'){
				alert('해당 센서가 아직 데이터를 수신하지 못했습니다.');
			}else{
				var zeropoint_cuttent_value = response.data;
				$('#medium_weight_label_'+current_sensor).data('content',zeropoint_cuttent_value.medium_weight);
				$('#medium_weight_text_'+current_sensor).text(zeropoint_cuttent_value.medium_weight);
				$('#drain_weight_text_'+current_sensor).data('content',zeropoint_cuttent_value.drain_weight);
				$('#drain_weight_text_'+current_sensor).text(zeropoint_cuttent_value.drain_weight);
				$('#ec_text_'+current_sensor).data('content',zeropoint_cuttent_value.ec);
				$('#ec_text_'+current_sensor).text(zeropoint_cuttent_value.ec);
				$('#ph_text_'+current_sensor).data('content',zeropoint_cuttent_value.ph);
				$('#ph_text_'+current_sensor).text(zeropoint_cuttent_value.ph);
				$('#co2_text_'+current_sensor).data('content',zeropoint_cuttent_value.co2);
				$('#co2_text_'+current_sensor).text(zeropoint_cuttent_value.co2);
				var placeholderTarget = $('.textbox input[type="text"], .textbox input[type="password"]');
				placeholderTarget.each(function(){ if($(this).val() != ''){ $(this).siblings('label').css('display','none'); } });

			}
		},
		error: function(response, status, error){
			console.log("error");
		}
	});
}

function setZeropoint(){
	var medium_weight = $('#medium_weight_input').val();
	var drain_weight = $('#drain_weight_input').val();
	var ec = $('#ec_input').val();
	var ph = $('#ph_input').val();
	var co2 = $('#co2_input').val();
	$.ajax({
		dataType: "json",
		url: server_address+"/zeropoint/update/id/"+current_sensor,
		type: "POST",
		data:{
			"medium_weight":medium_weight,
			"drain_weight":drain_weight,
			"ec":ec,
			"ph":ph,
			"co2":co2
		},
		success: function(response){
			console.log(response);
		},
		error: function(response, status, error){
			console.log("error");
		}
	});
	setIP();
}

function setIP(){
	var ip = $('#sensor_ip').val();
	ip = 'http://'+ip;
	$.ajax({
		dataType: "json",
		url: server_address+"/camera/sensor/"+current_sensor,
		type: "POST",
		data:{
			"ip":ip
		},
		success: function(response){
			console.log(response);
		},
		error: function(response, status, error){
			console.log("error");
		}
	});
}

function drawList(data){
	var contents = "";
	for(var i = 0;i<data.length;i++){
		array_sensor[i] = data[i];
		var url;
		if(data[i].url)
			url = data[i].url;
		else
			url = '-';
		contents+="<li id = sensor_"+data[i].id+">"
		+"<ul class=\"sensor-top-card-box\">"
		+"<li style=\"width:5%\"><div id=state_"+data[i].id+" style=\"background:#FEAF20;width:10px;height:100%;\"></div></li>"
		+"<li style=\"width:3%\"><input type=\"checkbox\" name = sensor_chk id=sensor_check value="+data[i].id+"></li>"

		+"<li><span id=manage_serial_"+data[i].id+">"+data[i].serial+"</span></li>"
		+"<li>"+data[i].title+"</li>"
		+"<li><span id=camera_url_"+data[i].id+">"+url+"</span></li>"
		+"<li><span id=camera_check_"+data[i].id+">"+url+"</span></li>"
		+"<li><span id=last_update_"+data[i].id+"></span></li>"
		+"<li class=\"sensor_detail\" style=\"width:5%;\" onclick='clickSensor(\""+data[i].id+"\",\""+data[i].serial+"\");'>"
		+"<img src=\"../img/detail.png\" style=\"width:15px;height:10px;\"></li></ul>";

		contents+="<div class=\"section-zeropoint\" id = zeropoint_"+data[i].id+" style=\"display:none\">"
		+"</br><label class=\"label_small_name_zeropoint\">현재값</label>"
		+"</br></br><ul class=\"zeropoint-label\">"
		+"<li><div class=\"zeropoint-box\"><span id = drain_weight_text_"+data[i].id+"></span></div></li>"
		+"<li><div class=\"zeropoint-box\"><span  id = medium_weight_text_"+data[i].id+"></span></div></li>"
		+"<li><div class=\"zeropoint-box\"><span id = ec_text_"+data[i].id+"></span></div></li>"
		+"<li><div class=\"zeropoint-box\"><span id = ph_text_"+data[i].id+"></span></div></li>"
		+"<li><div class=\"zeropoint-box\"><span id = co2_text_"+data[i].id+"></span></div></li>"
		+"</ul>"
		+"<ul class=\"zeropoint-label\">"
		+"<li><div class=\"zeropoint-box\">배액저울</div></li>"
		+"<li><div class=\"zeropoint-box\">배지저울</div></li>"
		+"<li><div class=\"zeropoint-box\">EC</div></li>"
		+"<li><div class=\"zeropoint-box\">PH</div></li>"
		+"<li><div class=\"zeropoint-box\">CO2</div></li>"
		+"</ul>"
		+"<div style=\"clear:both;\"></div></br>"
		+"<label class=\"label_small_name_zeropoint\">영점</label></br>	</br>"
		+"<ul class=\"sensor-top\">"
		+"<li><div class=\"textbox\"><label for=\"drain_weight_input\">배액저울</label><input type=\"text\" id = drain_weight_input_"+data[i].id+" style=\"width:90%;\"></div></li>"
		+"<li><div class=\"textbox\"><label for=\"medium_weight_input\">배지저울</label><input type=\"text\" id = medium_weight_input_"+data[i].id+" style=\"width:90%;\"></div></li>"
		+"<li><div class=\"textbox\"><label for=\"ec_input\">EC</label><input type=\"text\" id = ec_input_"+data[i].id+" style=\"width:90%;\"></div></li>"
		+"<li><div class=\"textbox\"><label for=\"ph_input\">PH</label><input type=\"text\" id = ph_input_"+data[i].id+" style=\"width:90%;\"></div></li>"
		+"<li><div class=\"textbox\"><label for=\"co2_input\">CO2</label><input type=\"text\" id = co2_input_"+data[i].id+" style=\"width:90%;\"></div></li>"
		+"</ul></br>"

		+"<label class=\"label_small_name_zeropoint\">IP</label>"
		+"</br></br><ul class=\"sensor-top\">"
		+"<li><div class=\"textbox\"><label for=sensor_ip_"+data[i].id+">센서IP</label>	<input type=\"text\" id = sensor_ip_"+data[i].id+" style=\"width:95%;\"></div></li>"
		+"<li><div class=\"textbox\"><label for=camera_ip_"+data[i].id+">카메라 IP</label><input type=\"text\" id = camera_ip_"+data[i].id+" style=\"width:95%;\"></div></li>"
		+"<li><input class=\"button\" type=\"button\" value = \"설정\" onclick=\"setZeropoint()\";></li></ul></div></li>";
	}
	$('#sensors').html(contents);
}

function clickInsertSensor(){
	var serial = $('#serial_input').val();
	$.ajax({
		dataType: "json",
		url: server_address+"/sensor/"+serial,
		type: "POST",
		success: function(response){
			console.log(response);
		},
		error: function(response, status, error){
			console.log(error);
		}
	});
}

function clickDeleteSensor(){
	if(confirm("삭제하시겠습니까?")){
	var serial = $('#serial_delete').val();
		$.ajax({
			dataType: "json",
			url: server_address+"/sensor/serial/"+serial,
			type: "DELETE",
			success: function(response){
				console.log(response);
			},
			error: function(response, status, error){
				console.log(error);
			}
		});
	}
}

function getZeropoint(sensor_id){

}

function findSensor(){
	var keyword = $('#find-sensor').val();
	var refresh_sensors = new Array();
	var count = 0;
	var contents="";
	for(var i = 0;i<array_sensor.length;i++){
		if(array_sensor[i].serial.indexOf(keyword)!=-1){
			refresh_sensors[count] = array_sensor[i];
			count++;
		}
	}
	drawList(refresh_sensors);
	setSensorConnectionState();
}

function closeZeropoint(){
	$('#zeropoint').hide();
}

function deleteSensors(){
	if(confirm("삭제하시겠습니까?")){
		$('#sensor_check:checked').each(function() { 
			var id = $(this).val();
			$.ajax({
				dataType: "text",
				url: server_address+"/sensor/id/"+id,
				type: "DELETE",
				success: function(response){
					setSensorList();
				},
				error: function(response, status, error){
					console.log(error);
				}
			});
		});
	}
}

function access(){
	var token = $('#input_access_token').val();
	$.ajax({
		dataType: "html",
		url: server_address+"/management",
		type: "post",
		data:{
			"access_token":token
		},
		success: function(response){
			if(response=='ok'){

			}
		},
		error: function(response, status, error){
			console.log(error);
		}
	});
}