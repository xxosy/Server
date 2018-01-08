var express = require('express');
var router = express.Router();
require('date-utils');
var database = require('./database');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');

router.post('/update/id/:id',function(req,res){
	var id = req.params.id;
	var usercode = req.body.usercode;
	var factor = req.body.factor;
	var zero_medium = req.body.medium_weight;
	var zero_drain = req.body.drain_weight;
	var zero_co2 = req.body.co2;
	var zero_ec = req.body.ec;
	var zero_ph = req.body.ph;

	var connection = database.getConnection();
	connection.query('update zeropoint set '+
		'medium_weight = \''+zero_medium+'\','+
		'drain_weight = \''+zero_drain+'\','+
		'co2 = \''+zero_co2+'\','+
		'ec = \''+zero_ec+'\','+
		'ph = \''+zero_ph+'\''+
		' where sensor_id = \''+id+'\';',function(err){
		if(err!==null){
			console.log(err);
			var result = response_maker.getResponse(404, null);
			res.json(result);
			res.end();
		}else{
			var result = response_maker.getResponse(200,'');
			res.json(result);
			res.end();
		}
	});
});

router.get('/id/:id',function(req,res){
	var id = req.params.id;
	var connection = database.getConnection();
	connection.query('select * from zeropoint where sensor_id = \''+id+'\';',function(err,rows){
		res.json(rows);
	});
});


router.get('/recent/id/:id',function(req,res){
	var id = req.params.id;
	var connection = database.getConnection();
	connection.query('select id,medium_weight,drain_weight,ec,ph,co2,sensor_id from value'+
	' where sensor_id=\''+id+'\' order by id DESC limit 1;',function(err,rows){
		if(rows=== null || rows.length === 0 ||rows === undefined){
			var result = response_maker.getResponse(404, null);
			res.json(result);
			res.end();
		}else{
			var result = response_maker.getResponse(200,rows[rows.length-1]);
			res.json(result);
			res.end();
		}
	});
});

module.exports = router;
