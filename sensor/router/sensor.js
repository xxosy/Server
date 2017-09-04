var express = require('express');
var router = express.Router();
var connection = require('./database');
var http = require('http');
var winston = require('winston');
require('date-utils');

router.post('/serial/:serial',function(req,res){
	var serial = req.params.serial;
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
	winston.log('info','POST Sensor serial Access device IP : '+req.connection.remoteAddress);
});

router.get('/serial/:serial',function(req,res){
	var serial = req.params.serial;
	connection.query('select * from sensor where serial = \''+serial+'\';',
		function(err,rows){
			console.log("sensors "+serial+"is requested")
			if(!rows.length){
				res.status(404).send('Not find serial')
				winston.log('error','Not find sensor serial : ' + serial);
				res.end();
			}else{
				res.jsonp(rows[rows.length-1]);
				res.end();
			}
		});
	winston.log('info','GET Sensor serial Access device IP : '+req.connection.remoteAddress);
});

router.delete('/serial/:serial',function(req,res){
	var serial = req.params.serial;
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

router.get('/list',function(req,res){
	var query = connection.query('select * from sensor',function(err,rows){
		console.log("sensors is requested")
		res.jsonp(rows);
	});
	winston.log('info','Sensor list Access device IP : '+req.connection.remoteAddress);
});

module.exports = router;
