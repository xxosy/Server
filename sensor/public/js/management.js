var server_address = 'http://211.230.136.100:3000'
var sensor_id;
var current_sensor;
function setSensorList(){
	sensor_id = new Array();
	$.ajax({
		dataType: "json",
		url: server_address+"/sensor/list/all",
		type: "GET",
		success: function(response){
			var contents = "";
			for(var i = 0;i<response.data.length;i++){
				contents+="<li id = sensor_"+response.data[i].id+" onclick='clickSensor(\""+response.data[i].id+"\",\""+response.data[i].serial+"\");'>"+response.data[i].serial+"</li>"
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
				console.log(date);
				var update_time = response.update_time;
				var sp = update_time.split(':');
				var t = (sp[1]*1)+sp[0]*60;
				console.log(t);
				console.log(time);
				console.log(date === update_date);
				console.log(t>time);
				console.log(date === update_date && t>time);
				if(date === update_date && t>time){
					$('#sensor_'+response.sensor_id).css("color","green");
				}else{
					$('#sensor_'+response.sensor_id).css("color","red");
				}
			},
			error: function(response, status, error){
				console.log(error);
			}
		});
	}
}

function clickSensor(sensor_id,serial){
	$('#medium_weight_text').text("");
	$('#drain_weight_text').text("");
	$('#ec_text').text("");
	$('#ph_text').text("");
	$('#co2_text').text("");
	current_sensor = sensor_id;
	$('#selected-sensor').text('영점 설정 : ' +serial);
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
				$('#medium_weight_text').text(zeropoint_cuttent_value.medium_weight);
				$('#drain_weight_text').text(zeropoint_cuttent_value.drain_weight);
				$('#ec_text').text(zeropoint_cuttent_value.ec);
				$('#ph_text').text(zeropoint_cuttent_value.ph);
				$('#co2_text').text(zeropoint_cuttent_value.co2);
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

function getZeropoint(sensor_id){

}

