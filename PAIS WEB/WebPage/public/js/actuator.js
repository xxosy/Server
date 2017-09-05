var state = [0,0,0,0,0,0,0,0];
var str_state="00000000";
function updateActuatorState(){
	$.ajax({
		url:"http://221.159.48.9:3000/actuator/state/commandstate",
		type: "POST",
		dataType:"json",
		data:{
			"state":str_state
		},
		success:function(response){
			var currentstate = response.currentstate;
			var states = new Array(8);
			states[0] = currentstate.substr(0,1);
			states[1] = currentstate.substr(1,1);
			states[2] = currentstate.substr(2,1);
			states[3] = currentstate.substr(3,1);
			states[4] = currentstate.substr(4,1);
			states[5] = currentstate.substr(5,1);
			states[6] = currentstate.substr(6,1);
			states[7] = currentstate.substr(7,1);
			for(var i = 0;i<8;i++){
				if(states[i] == 0)
					$('#actuator_port_state_'+i).attr("class","actuator_checker_off");
				else if(states[i] == 1)
					$('#actuator_port_state_'+i).attr("class","actuator_checker_on");
			}
			if(response.url != null){
				console.log(response[0].currentstate);
			}
		}
	});
}

function setState(index, command){
	if(command == 0)
		state[index] = 0;
	else if(command == 1)
		state[index] = 1;
	str_state = state.join("");
	console.log(str_state);
	updateActuatorState();
}

function setCurrentState() {
	$.ajax({
		url:"http://221.159.48.9:3000/actuator/currentstate",
		type: "GET",
		dataType:"json",
		success:function(response){
			var currentstate = response.currentstate;
			var states = new Array(8);
			states[0] = currentstate.substr(0,1);
			states[1] = currentstate.substr(1,1);
			states[2] = currentstate.substr(2,1);
			states[3] = currentstate.substr(3,1);
			states[4] = currentstate.substr(4,1);
			states[5] = currentstate.substr(5,1);
			states[6] = currentstate.substr(6,1);
			states[7] = currentstate.substr(7,1);
			for(var i = 0;i<8;i++){
				if(states[i] == 0)
					$('#actuator_port_state_'+i).attr("class","actuator_checker_off");
				else if(states[i] == 1)
					$('#actuator_port_state_'+i).attr("class","actuator_checker_on");
			}
			response.currentstate;
			if(response.url != null){
				console.log(response[0].currentstate);
			}
		}
	});
    setTimeout("setCurrentState()", 1000);
}

function getCommandState(){
	$.ajax({
		url:"http://221.159.48.9:3000/actuator/commandstate",
		type: "GET",
		dataType:"json",
		success:function(response){
			var commandstate = response.commandstate;
			str_state = commandstate;
			state[0] = commandstate.substr(0,1);
			state[1] = commandstate.substr(1,1);
			state[2] = commandstate.substr(2,1);
			state[3] = commandstate.substr(3,1);
			state[4] = commandstate.substr(4,1);
			state[5] = commandstate.substr(5,1);
			state[6] = commandstate.substr(6,1);
			state[7] = commandstate.substr(7,1);
			console.log(response.commandstate);
			if(response.url != null){
				
			}
		}
	});
}