var sensor_id;
function setSensorList(){
	sensor_id = new Array();
	$.ajax({
		dataType: "jsonp",
		url: "http://localhost:3000/sensor/list",
		type: "GET",

		success: function(response){
			var contents = "";
			for(var i = 0;i<response.length;i++){
				contents+="<li>"+response[i].serial+"</li>"
				sensor_id.push(response[i].id);
				console.log(sensor_id);
			}
			$('#sensors').html(contents);
			setSensorConnectionState();
		},
		error: function(response, status, error){
			console.log("error");
		}
	});
}

function setSensorConnectionState(){
	for(var i = 0;i<sensor_id.length;i++){
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
				var time = HH+':'+mm;
				console.log(date);
				console.log(time);
				console.log(time>response.update_time);
				if(date === response.update_date && time<response.update_time){
					console.log("alive");
				}else{
					console.log("dead");
				}
				console.log(response);
			},
			error: function(response, status, error){
				console.log("error");
			}
		});
	}
}