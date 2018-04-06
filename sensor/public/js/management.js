var server_address = ''
var sensor_id;
var current_sensor;
var array_sensor = new Array();
function setSensorList(){
	sensor_id = new Array();
	$.ajax({
		dataType: "json",
		url: server_address+"/sensor/list/all",
		type: "GET",
		success: function(response){
			var contents = "";
			for(var i = 0;i<response.data.length;i++){
				array_sensor[i] = response.data[i];
				contents+="<li id = sensor_"+response.data[i].id+" onclick='clickSensor(\""+response.data[i].id+"\",\""+response.data[i].serial+"\");'>"+response.data[i].serial+"   "+response.data[i].title+"</li>"
				sensor_id.push(response.data[i].id);
			}
			$('#sensors').html(contents);
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
					$('#sensor_'+response.sensor_id).css("color","green");
				}else{
					$('#sensor_'+response.sensor_id).css("color","red");
				}
			},
			error: function(response, status, error){
				console.log(error);
				console.log(response);
			}
		});
	}
}

function clickSensor(sensor_id,serial){
	$('#medium_weight_text').text('배지저울');
	$('#drain_weight_text').text('배액저울');
	$('#ec_text').text("ec");
	$('#ph_text').text("ph");
	$('#co2_text').text("co2");
	current_sensor = sensor_id;
	$('#selected-sensor').text('영점 설정 : ' +serial);
	$('#serial_delete').val(serial);
	$('#zeropoint').show();
	$.ajax({
		dataType: "json",
		url: server_address+"/zeropoint/id/"+current_sensor,
		type: "GET",
		success: function(response){
			var zeropoint = response[0];
			$('#medium_weight_input').val(zeropoint.medium_weight);
			$('#drain_weight_input').val(zeropoint.drain_weight);
			$('#ec_input').val(zeropoint.ec);
			$('#ph_input').val(zeropoint.ph);
			$('#co2_input').val(zeropoint.co2);
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
			$('#ip').val(response);
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
				$('#IP_text').text(response.data[0].url);
			else
				$('#IP_text').text("-");
		},
		error: function(response, status, error){
			console.log("error");
		}		
	});
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
				$('#medium_weight_label').data('content', '배지저울 : '+zeropoint_cuttent_value.medium_weight);
				$('#medium_weight_text').text('배지저울 : '+zeropoint_cuttent_value.medium_weight);
				$('#drain_weight_text').data('content', '배액저울 : '+zeropoint_cuttent_value.drain_weight);
				$('#drain_weight_text').text('배액저울 : '+zeropoint_cuttent_value.drain_weight);
				$('#ec_text').data('content', 'ec : '+zeropoint_cuttent_value.ec);
				$('#ec_text').text('ec : '+zeropoint_cuttent_value.ec);
				$('#ph_text').data('content', 'ph : '+zeropoint_cuttent_value.ph);
				$('#ph_text').text('ph : '+zeropoint_cuttent_value.ph);
				$('#co2_text').data('content', 'co2 : '+zeropoint_cuttent_value.co2);
				$('#co2_text').text('co2 : '+zeropoint_cuttent_value.co2);
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
}

function setIP(){
	var ip = $('#ip').val();
	ip = 'http://'+ip;
	$.ajax({
		dataType: "json",
		url: server_address+"/camera/sensor/"+current_sensor,
		type: "POST",
		data:{
			"http_port":'3333',
			"onvif_port":'3335',
			"ip":ip
		},
		success: function(response){
			console.log(response);
		},
		error: function(response, status, error){
			console.log("error");
		}
	});

	$.ajax({
		dataType: "json",
		url: server_address+"/camera/sensor/"+current_sensor,
		type: "POST",
		data:{
			"http_port":'3334',
			"onvif_port":'3336',
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
	for(var i = 0;i<refresh_sensors.length;i++){
		contents+="<li id = sensor_"+refresh_sensors[i].id+" onclick='clickSensor(\""+refresh_sensors[i].id+"\",\""+refresh_sensors[i].serial+"\");'>"+refresh_sensors[i].serial+"   "+refresh_sensors[i].title+"</li>"
	}
	$('#sensors').html(contents);
	setSensorConnectionState();
}

function closeZeropoint(){
	$('#zeropoint').hide();
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