var express = require('express');
var router = express.Router();
var HashMap = require('hashmap');
var database = require('./database');
var response_maker = require('../util/response-rule');
var encryption = require('../util/encryption');
var recentHash = new HashMap();
var connection = database;
require('date-utils');

router.post('/weight',function(req,res){
	var serial = req.body.serial;
	var medium_weight = req.body.medium_weight;
	var drain_weight = req.body.drain_weight;
	var connection = database.getConnection();
	var date = new Date();
	var update_date = date.toFormat('YYYYMMDD');
	var update_time = date.toFormat('HH24:MI:SS');
	var recent = {
		"update_date" : update_date,
		"update_time" : update_time,
		"serial_id" : serial,
		"medium_weight" : medium_weight,
		"drain_weight" : drain_weight
	}
	recentHash.set(serial,recent);
});

router.get('/weight/recent/serial/:serial',function(req,res){
	var serial = req.params.serial;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('select id from sensor where serial = \''+serial+'\';',function(err,rows){
			if(rows===undefined && rows === null){
				var result = response_maker.getResponse(405, null);
				res.json(result);
				res.end();
			}else{
				if(!rows.length){
					var result = response_maker.getResponse(404, "sensor");
					res.json(result);
					res.end();
				}else{
					var temp = recentHash.get(serial);
					if(temp!==undefined){
						var recent = {
							"serial_id" : rows[0].id,
							"update_date" : temp.update_date,
							"update_time" : temp.update_time,
							"medium_weight" : temp.medium_weight,
							"drain_weight" : temp.drain_weight
						}
						var result = response_maker.getResponse(200, recent);
						res.json(result);
						res.end();
					}else{
						var result = response_maker.getResponse(404, "recent");
						res.json(result);
						res.end();
					}
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