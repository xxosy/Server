var express = require('express');
var router = express.Router();
var database = require('./database');
require('date-utils');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');

router.get('/:serial/:date',function(req,res){
	var serial = req.params.serial;
	var date = req.params.date;
	console.log(serial);
	console.log(date);
	var connection = database.getConnection();
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			var result = response_maker.getResponse(500, null);
			res.json(result);
			res.end();
		}else{
			if(rows=== null || rows.length === 0 || rows === undefined){
				var result = response_maker.getResponse(404, 'sensor');
				res.json(result);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select * from journal where sensor_id = \''+sensor_id+
					'\' and date = \''+date+'\' order by id DESC limit 1;',function(err,rows){
						if(rows=== null || rows.length === 0 || rows === undefined){
							var result = response_maker.getResponse(404, 'journal');
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
});

router.post('/',function(req,res){
	var serial = req.body.serial;
	var usercode = req.body.usercode;
	var date = req.body.date;
	var condition = req.body.condition;
	var significant = req.body.significant;
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
				connection.query('insert into journal(`sensor_id`,`condition`,`significant`,`date`)'+
					' values(\''+sensor_id+'\','+
					'\''+condition+'\','+
					'\''+significant+'\','+
					'\''+date+'\');',
					function(err){
						var result = response_maker.getResponse(200, null);
						res.json(result);
						res.end();
					});
			}
		}
	});
});

module.exports = router;
