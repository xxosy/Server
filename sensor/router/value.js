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
var serial_ip = new hashMap();
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
				connection.query('select value.id,value.sensor_id,'+
					'value.temperature,value.temperature_ds,value.humidity,'+
					'value.co2,value.light,value.ec,'+
					'value.ph,value.medium_weight,'+
					'value.drain_weight,update_date,update_time '+
					'from value '+
					'where value.sensor_id = \''+id+'\' '+
					'order by id DESC limit 1;',function(err,rows){
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
	connection.query('select sensor_id, update_date, update_time from value where sensor_id = \''+sensor_id+'\'order by id DESC limit 1;',function(err,rows){
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
	// console.log(req.body);
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
	// var cipherd_temperature = encryption.fcrypto(temperature);
    var getClientAddress =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var clientIPAddress = getClientAddress.substring(7,getClientAddress.length)
    console.log(serial + " - " + clientIPAddress);
    serial_ip.set(serial,clientIPAddress);
	connection.query('select s.id, z.medium_weight, z.drain_weight, z.ec, z.ph, z.co2 from sensor s, zeropoint z where z.sensor_id = s.id and s.serial =\''+serial+'\';',function(err,rows){
		console.log(rows.length);

		if(rows.length || rows!==null ||rows!=undefined){
			var sensor_id = rows[rows.length-1].id;
			var zeropoint_medium_weight = Number(rows[rows.length-1].medium_weight);
			var zeropoint_drain_weight = Number(rows[rows.length-1].drain_weight);
			var zeropoint_ec = Number(rows[rows.length-1].ec);
			var zeropoint_ph = Number(rows[rows.length-1].ph);
			var zeropoint_co2 = Number(rows[rows.length-1].co2);

			var num_medium_weight = Number(medium_weight);
			var num_drain_weight = Number(drain_weight);
			var num_ec = Number(ec);
			var num_ph = Number(ph);
			var num_co2 = Number(co2);

			medium_weight = num_medium_weight - zeropoint_medium_weight;
			medium_weight = medium_weight.toFixed(3);
			medium_weight +="";
			drain_weight = num_drain_weight - zeropoint_drain_weight;
			drain_weight = drain_weight.toFixed(3);
			drain_weight +="";
			ec = num_ec - zeropoint_ec;
			ec = ec.toFixed(3);
			ec +="";
			ph = num_ph - zeropoint_ph;
			ph = ph.toFixed(3);
			ph +="";
			co2 = num_co2 - zeropoint_co2;
			co2 = co2.toFixed(3);
			co2 +="";


			connection.query('insert into value(`temperature`,`temperature_ds`,`humidity`,`co2`,`light`,`ec`,`ph`,`medium_weight`,`drain_weight`,`update_time`,`update_date`,`sensor_id`) '+
				'values(\''+temperature+'\',\''
				+temperature_ds+'\',\''
				+humidity+'\',\''
				+co2+'\',\''
				+light+'\',\''
				+ec+'\',\''
				+ph+'\',\''
				+medium_weight+'\',\''
				+drain_weight+'\',\''
				+update_time+'\',\''+update_date+'\',\''+sensor_id+'\');',function(err){
					if(err == null){
							// console.log('sensor '+sensor_id+'value is inserted : '+update_time);

						}else if(err.code === 'ER_NO_REFERENCED_ROW_2'){
							res.send('sensor id is not exist')
						}else{
							console.log(err.code);
							console.log(err);
						}
					});
			
		}else{
			res.status(404).send('NOT find list for serial :'+serial);
		}
	});
});
router.get('/tempIPAddress/:serial',function(req,res){
	var serial = req.params.serial;
	var ip = serial_ip.get(serial);
	res.send(ip);
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
					connection.query('select v.id, v.temperature,v.temperature_ds,v.humidity,v.co2 as co2,light,v.ec as ec,v.ph as ph,v.medium_weight as medium_weight,v.drain_weight as drain_weight, update_date,update_time,v.sensor_id from value v where v.sensor_id=\''
						+sensor_id+'\' and update_date = \''
						+update_date+'\';',function(err,rows){
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


router.get('/test',function(req,res){
	var connection = database.getConnection();
	connection.query('select * from `valuetest_nopk` limit 1000000, 500000;',function(err,rows){
		var sequense = 100000;
		for(var i = 0;i<rows.length;i++){
			var date = new Date(rows[i].update_date);
			var yy = date.toFormat('YYYY');
			var mm = date.toFormat('MM');
			var dd = date.toFormat('DD');

			var indexkey = yy+mm+dd+rows[i].sensor_id+sequense;
			indexkey = indexkey*1;
			// console.log(indexkey);
			connection.query('insert into valuetest_new(`temperature`,`temperature_ds`,`humidity`,`co2`,`light`,`ec`,`ph`,`indexkey`,`update_time`,`update_date`,`sensor_id`) '+
					'values(\''+rows[i].temperature+'\',\''
					+rows[i].temperature_ds+'\',\''
					+rows[i].humidity+'\',\''
					+rows[i].co2+'\',\''
					+rows[i].light+'\',\''
					+rows[i].ec+'\',\''
					+rows[i].ph+'\','+indexkey+',\''
					+rows[i].update_time+'\',\''+rows[i].update_date+'\',\''+rows[i].sensor_id+'\');',function(err){
						console.log(err);
					});
			sequense++;
			if(sequense>999999){
				sequense = 100000;
			}
		}
		res.end();
	});
});

module.exports = router;