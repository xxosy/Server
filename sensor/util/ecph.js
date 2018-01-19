var calcec = function(temperature, ec){
	var tempCoefficient = 1.0+0.0185*(temperature-25.0);
	var coefficientVoltage = ec/tempCoefficient;
	var data_ec;
	if(coefficientVoltage<150) data_ec = 0;
	else if(coefficientVoltage>3300)data_ec = 19768;
	else
	{
		if(coefficientVoltage<=448)data_ec=6.84*coefficientVoltage-64.32;
		else if(coefficientVoltage<=1457)data_ec=6.98*coefficientVoltage-127;
		else data_ec=5.3*coefficientVoltage+2278;     	
	}

	var result = data_ec.toFixed(2);
	result *= 1;
	result /=1000;
	result = result.toFixed(2);
	
	return result;
}

var calcph = function(ph){
	var result = ph;
	result = 3.5*result;
	result = result.toFixed(2);
	result = result+"";
	return result;
}

module.exports = {
	calcec : calcec,
	calcph : calcph
};