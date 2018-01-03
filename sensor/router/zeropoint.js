var express = require('express');
var router = express.Router();
require('date-utils');
var database = require('./database');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');

router.post('/update',function(req,res){
	var serial = req.body.serial;
	var usercode = req.body.usercode;
	var factor = req.body.factor;
	var v_zeropoint = req.body.zeropoint;
	var retrievedSignature = req.headers["x-signature"];
	var access = encryption.hmac(retrievedSignature,usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('select * from sensor where serial=\''+serial+'\';',function(err,rows){
			if(rows=== null || rows.length==0 || rows === undefined){
				var result = response_maker.getResponse(404, null);
				res.json(result);
				res.end();
			}else{
				var id = rows[rows.length-1].id;
				connection.query('update zeropoint set '+factor+' = \''+v_zeropoint+'\' where sensor_id = \''+id+'\';',function(err,rows){
					if(rows === null || rows.length == 0 || rows === undefined){
						var result = response_maker.getResponse(404, null);
						res.json(result);
						res.end();
					}else{
						var result = response_maker.getResponse(200,'');
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

