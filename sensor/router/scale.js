var express = require('express');
var router = express.Router();
var HashMap = require('hashmap');
var database = require('./database');
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
	var connection = database.getConnection();
	connection.query('select id from sensor where serial = \''+serial+'\';',function(err,rows){
		if(rows!==undefined){
			if(!rows.length){
				res.status(404);
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
					res.jsonp(recent);
					res.end();
				}else{
					res.status(404);
					res.end();
				}
			}
		}else{
			res.end();
		}
	});
});

module.exports = router;