var getResponse = function(code,data){
	var state;
	var message;
	if(code === 200){
		state = "success";
		message = "request is success";
	}else if(code === 404){
		state = "fail";
		message = "request is not found : length is zero";
	}else if(code === 500){
		state = "fail";
		message = "request is fail by error";
	}else{
		state = 'fail';
		message = 'unknown error'
	}

	var result = {
		"status":state,
		"statecode":code,
		"message":message,
		"data":data
	}

	return result;
}

module.exports = {
	getResponse:getResponse
};