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
	// if(access){
		var connection = database.getConnection();		
		connection.query('select sensor.title, sensor.serial, concat(camera.url,\":\",camera.http_port) as url, camera.url as ip, camera.http_port, camera.onvif_port from camera '+
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
	// }else{
	// 	var result = response_maker.getResponse(401,null);
	// 	res.json(result);
	// 	res.end();
	// }
});

router.get('/sensor/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	var connection = database.getConnection();		
	connection.query('select url from camera '+
		'where sensor_id = '+serial+';',function(err,rows){
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
});

router.post('/sensor/:serial',function(req,res){
	var serial = req.params.serial;
	var ip = req.body.ip;
	var retrievedSignature = req.headers["x-signature"];
	var connection = database.getConnection();

	var id = serial;
	
	connection.query('update camera set `url` = \''+ip+'\' where sensor_id = \''+id+'\';',function(err){
		if(err){
			var result = response_maker.getResponse(500,err);
			res.json(result);
			res.end();
		}else{
			var result = response_maker.getResponse(200,null);
			res.json(result);
			res.end();
		}
	});

});

module.exports = router;