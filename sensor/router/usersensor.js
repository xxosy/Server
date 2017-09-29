var express = require('express');
var router = express.Router();
var database = require('./database');
var winston = require('winston');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');

router.get('/sensors',function(req,res){
	var usercode = req.headers["authorization"];
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,usercode);
	console.log(usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('select user.name, user.code as usercode, sensor.serial, sensor.lat, sensor.lng, sensor.title from usersensor '+
			'inner join user on usersensor.user_id = user.id '+
			'inner join sensor on sensor.id = usersensor.sensor_id '+
			'where user.code = \''+usercode+'\';',function(err,rows){
				if(rows === undefined || rows.length === 0 || rows === null){
					var result = response_maker.getResponse(404,rows);
					res.json(result);
					res.end();
				}else{
					var result = response_maker.getResponse(200,rows);
					res.json(result);
					res.end();
				}
				if(err!==undefined && err !== null){
					winston.log('error','usersensor get error : '+err);
				}
			});
	}else{
		var result = response_maker.getResponse(401,null);
		res.json(result);
		res.end();
	}
});

router.post('/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var usercode = req.headers["authorization"];
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('select sensor.id as sensor_id, user.id as user_id '+
			'from sensor, user where sensor.serial = \''+serial+'\''+
			' && user.code = \''+usercode+'\';',function(err,rows){
			if(err !== null) console.log(err);
			if(rows === undefined || rows === null ||  rows.length === 0){
				var result = response_maker.getResponse(404,null);
				res.json(result);
				res.end();
			}else{
				var user_id = rows[0].user_id;
				var sensor_id = rows[0].sensor_id;
				connection.query('insert into usersensor(`user_id`,`sensor_id`)'+
					' values(\''+user_id+'\','+
					'\''+sensor_id+'\');',
					function(err){
						if(err===undefined || err===null){
							var result = response_maker.getResponse(200,null);
							res.json(result);
							res.end();
						}else{
							var result = response_maker.getResponse(500,null);
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

router.delete('/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var usercode = req.headers["authorization"];
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('delete from usersensor '+
			'where usersensor.sensor_id = (select id from sensor where serial = \''+serial+
			'\') && usersensor.user_id = (select id from user where code = \''+usercode+'\');',function(err){
				if(err===undefined || err===null){
					var result = response_maker.getResponse(200,null);
					res.json(result);
					res.end();
				}else{
					var result = response_maker.getResponse(500,null);
					res.json(result);
					res.end();
				}
			});
	}else{
		var result = response_maker.getResponse(401,null);
		res.json(result);
		res.end();
	}
});

module.exports = router;