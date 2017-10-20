var express = require('express');
var router = express.Router();
require('date-utils');
var database = require('./database');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');
var ecph = require('../util/ecph');

router.get('/list/sensor/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	if(access){
		var connection = database.getConnection();		
		connection.query('select sensor.title, sensor.serial, camera.url from camera '+
			'inner join sensor on camera.sensor_id = sensor.id '+
			'where sensor.serial = \''+serial+'\';',function(err,rows){
			if(rows===undefined || rows === null){
				var result = response_maker.getResponse(405, null);
				res.json(result);
				res.end();
			}else{
				if(!rows.length){
					var result = response_maker.getResponse(404, "sensor");
					res.json(result);
					res.end();
				}else{
					var result = response_maker.getResponse(200, rows);
					res.json(result);
					res.end();
				}
			}
		});
	}else{
		var result = response_maker.getResponse(401,null);
		res.json(result);
		res.end();
	}
});

module.exports = router;