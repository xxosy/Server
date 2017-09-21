var express = require('express');
var router = express.Router();
var database = require('./database');
var http = require('http');
var winston = require('winston');
require('date-utils');
var response_maker = require('../util/response-rule');

router.post('/update/serial/:serial',function(req,res){
	var serial = req.params.serial;
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
});

router.get('/:serial',function(req,res){
	var serial = req.params.serial;
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
});

router.post('/:serial',function(req,res){
	var serial = req.params.serial;
	var connection = database.getConnection();
	connection.query('select * from sensor where serial = \''+serial+'\';',
		function(err,rows){
			if(rows.length == 0){
				var query = connection.query('insert into sensor (`name`,`serial`) '+
					'values (\''+serial+'\',\''+serial+'\');');
				res.send("insert sensor");
				console.log("insert sensor");
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

module.exports = router;
