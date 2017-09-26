var crypto = require('crypto');
var url = require("url");

var fcrypto = function(value){
	var cipher = crypto.createCipher('aes-128-ecb', 'pais');
	cipher.update(value,'utf-8','hex');
	var cipherd_value = cipher.final('hex');
	return cipherd_value;
}

var fdecrypto = function(value){
	var decipher = crypto.createDecipher('aes-128-ecb','pais');
	var cipherd_value = decipher.update(value,'hex','utf8');
	cipherd_value += decipher.final('utf8');
	return cipherd_value;
}

var hmac = function(retrievedSignature, key){
	var sharedSecret = "pais-access-secret";
	var computedSignature = crypto.createHmac("sha256", sharedSecret).update(key).digest("hex");
	if (computedSignature === retrievedSignature) {
		return true;
	} else {
		return false;
	}
}
module.exports = {
	fcrypto : fcrypto,
	fdecrypto : fdecrypto,
	hmac:hmac
};
