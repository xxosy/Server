var express = require('express');
var router = express.Router();
require('date-utils');
var winston = require('winston');
var hashMap = require('hashmap');
var http = require('http');
var requestIp = require('request-ip');
var database = require('./database');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');
var ecph = require('../util/ecph');
var count = 0;

router.get('/recent/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	if(access){
		var connection = database.getConnection();
		connection.query('select * from sensor where serial=\''+serial+'\';',function(err,rows){
			if(rows=== null || rows.length==0 || rows === undefined){
				var result = response_maker.getResponse(404, null);
				res.json(result);
				res.end();
			}else{
				var id = rows[rows.length-1].id;
				connection.query('select * from value where sensor_id = \''+id+'\'order by id DESC limit 1;',function(err,rows){
					if(rows=== null || rows.length==0 || rows === undefined){
						var result = response_maker.getResponse(404, null);
						res.json(result);
						res.end();
					}else{
						var result = response_maker.getResponse(200,rows[rows.length-1]);
						res.json(result);
						res.end();
					}
				});
			}
		});
	}else{
		var result = response_maker.getResponse(401,null);
		res.json(result);
		res.end();
	}     
});

router.get('/check/sensor/:sensor_id',function(req,res){
	var sensor_id = req.params.sensor_id;
	var connection = database.getConnection();
	connection.query('select update_date, update_time from value where sensor_id = \''+sensor_id+'\'order by id DESC limit 1;',function(err,rows){
		res.json(rows[rows.length-1]);
	});
});

router.post('/',function(req,res){
	var date = new Date();
	var crypto = require('crypto');
	var connection = database.getConnection();
	var temperature = req.body.temperature;
	var temperature_ds = req.body.temperature_ds;
	var humidity = req.body.humidity;
	var co2 = req.body.co2;
	var light = req.body.light;
	var ec = req.body.ec;
	var ph = req.body.ph;
	var serial = req.body.serial;
	var medium_weight = req.body.medium_weight;
	var drain_weight = req.body.drain_weight;

	var num_light = Number(light);
	if(num_light>25000){
		num_light = 25000;
	}
	light = num_light;
	light = light+"";
	num_light = num_light*2.7;
	
	var calcph = ecph.calcph(ph);
	var calcec = ecph.calcec(temperature_ds,ec);

	ph = calcph;
	ec = calcec;

	var update_date=date.toFormat('YYYY-MM-DD');
	var update_time=date.toFormat('HH24:MI');
	var array = {
		"temperature":temperature,
		"temperature_ds":temperature_ds,
		"humidity":humidity,
		"co2":co2,
		"light":light,
		"ec":ec,
		"ph":ph,
		"medium_weight":medium_weight,
		"drain_weight":drain_weight
	};
	console.log(array);
	var json_value = JSON.stringify(array);
	console.log(json_value);

	// var cipherd_temperature = encryption.fcrypto(temperature);

	connection.query('select id from sensor where serial=\''+serial+'\';',function(err,rows){
		if(rows!==undefined){
			var sensor_id = rows[rows.length-1].id;
			if(!rows.length){
				res.status(404).send('NOT find list for serial :'+serial);
			}else{
				connection.query('insert into value(`value`,`update_time`,`update_date`,`sensor_id`) '+
					'values(\''+json_value+'\',\''+update_time+'\',\''+update_date+'\',\''+sensor_id+'\');',function(err){
						if(err == null){
							console.log('sensor '+sensor_id+'value is inserted : '+update_time);

						}else if(err.code === 'ER_NO_REFERENCED_ROW_2'){
							res.send('sensor id is not exist')
						}else{
							console.log(err.code);
						}
					});
			}
		}else{
			res.status(404).send('NOT find list for serial :'+serial);
		}
	});
});

router.get('/list/all/:serial/:date',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	if(access){
		var update_date = new Date(req.params.date);
		update_date = update_date.toFormat('YYYY-MM-DD');
		var connection = database.getConnection();
		connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
			if(err!==null){
				var result = response_maker.getResponse(500, null);
				res.json(result);
				res.end();
			}else{
				if(rows=== null || rows.length === 0 || rows === undefined){
					var result = response_maker.getResponse(404, null);
					res.json(result);
					res.end();
				}else{
					var sensor_id = rows[rows.length-1].id;
					connection.query('select id, value, update_time,sensor_id from value where sensor_id=\''
						+sensor_id+'\' and update_date = \''
						+update_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
							if(rows=== null || rows.length === 0 || rows === undefined){
								var result = response_maker.getResponse(404, null);
								res.json(result);
								res.end();
							}else{
								var result = response_maker.getResponse(200, rows);
								res.json(result);
								res.end();
							}
						});
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