var sensor_id;
function setSensorList(){
	sensor_id = new Array();
	$.ajax({
		dataType: "json",
		url: "http://localhost:3000/sensor/list/all",
		type: "GET",
		success: function(response){
			var contents = "";
			for(var i = 0;i<response.data.length;i++){
				contents+="<li id = sensor_"+response.data[i].id+">"+response.data[i].serial+"</li>"
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
			url: "http://localhost:3000/value/check/sensor/"+sensor_id[i],
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
				if(date === response.update_date && t>time){
					$('#sensor_'+response.sensor_id).html('  alive');
				}else{
					$('#sensor_'+response.sensor_id).append('  dead');
				}
			},
			error: function(response, status, error){
				console.log("error");
			}
		});
	}
}