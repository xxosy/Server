var express = require('express');
var router = express.Router();
var database = require('./database');
var http = require('http');
var winston = require('winston');
require('date-utils');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');

router.post('/update/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	if(access){
		var lat = req.body.lat;
		var lng = req.body.lng;
		var title = req.body.title;
		console.log(serial);
		console.log(lat);
		console.log(lng);
		var connection = database.getConnection();
		connection.query('update sensor set lat=\''+lat+'\',lng=\''+lng+'\',title=\''+title+'\' where serial = \''+serial+'\';',function(err){
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

router.get('/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,serial);
	if(access){
		var connection = database.getConnection();
		connection.query('select * from sensor where serial = \''+serial+'\';',
			function(err,rows){
				if(rows=== null || rows.length==0 || rows === undefined){
					var result = response_maker.getResponse(404, null);
					res.jsonp(result);
					res.end();
				}else{
					var result = response_maker.getResponse(200,rows[rows.length-1]);
					res.jsonp(result);
					res.end();
				}
			});
	}else{
		var result = response_maker.getResponse(401,null);
		res.json(result);
		res.end();
	}
});

router.get('/list/all',function(req,res){
	var connection = database.getConnection();
	connection.query('select * from sensor;',
		function(err,rows){
			if(rows=== null || rows.length==0 || rows === undefined){
				var result = response_maker.getResponse(404, null);
				res.jsonp(result);
				res.end();
			}else{
				var result = response_maker.getResponse(200,rows);
				res.jsonp(result);
				res.end();
			}
		});
});

router.get('/camera/list/all',function(req,res){
	var connection = database.getConnection();
	connection.query('select distinct sensor.id, sensor.serial, sensor.title, camera.url from camera right join sensor on camera.sensor_id = sensor.id order by sensor.id;',
		function(err,rows){
			if(rows=== null || rows.length==0 || rows === undefined){
				var result = response_maker.getResponse(404, null);
				res.jsonp(result);
				res.end();
			}else{
				var result = response_maker.getResponse(200,rows);
				res.jsonp(result);
				res.end();
			}
		});
});

router.post('/:serial',function(req,res){
	var serial = req.params.serial;
	var connection = database.getConnection();
	console.log(serial);
	connection.query('select * from sensor where serial = \''+serial+'\';',
		function(err,rows){
			if(rows.length == 0){
				connection.query('insert into sensor (`title`,`serial`) '+
					'values (\''+serial+'\',\''+serial+'\');',function(err,result){
						connection.query('insert into zeropoint (`sensor_id`) values (\''+result.insertId+'\');',function(err,result){
							res.send("insert sensor");
							console.log("insert sensor");
						});
					});
			}else{
				res.send("this serial is already exist");
				console.log("this serial is already exist");
			}
		});
});

router.delete('/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var connection = database.getConnection();
	connection.query('select * from sensor where serial = \''+serial+'\';',
		function(err,rows){
			if(!rows.length){
				res.send(serial+" is not exist");
				winston.log('error','DELETE Sensor serial :'+serial);
				res.end();
			}else{
				var query = connection.query('delete from sensor '
					+'where serial = \''+serial+'\';');
				res.send(serial+" is deleted");
				console.log(serial+" is deleted");
			}
		});
});

router.delete('/id/:id',function(req,res){
	var id = req.params.id;
	var connection = database.getConnection();
	connection.query('delete from sensor where id = \''+id+'\';');
	res.end();
});

module.exports = router;
