var express = require('express');
var router = express.Router();
var database = require('./database');
var encryption = require('../util/encryption');
var response_maker = require('../util/response-rule');
router.get('/:usercode',function(req,res){
	var usercode = req.params.usercode;

	connection.query('select * from user where usercode = \''+usercode+'\';',function(err,rows){
		if(rows.length==0){
			console.log("asasdsa");
			res.send("{\"id\": 0,\"usercode\": \"null\"}");
		}else
		res.jsonp(rows[rows.length-1]);
	});
});

router.post('/:usercode',function(req,res){
	var usercode = req.params.usercode;
	console.log(req.body);
	var name = req.body.name;
	var retrievedSignature = req.headers["x-signature"];
	console.log(name);
	console.log(retrievedSignature);
	console.log(usercode);
	var access = encryption.hmac(retrievedSignature,usercode);
	if(access){
		var connection = database.getConnection();
		connection.query('insert into user(`name`,`code`) values(\''+name+'\',\''+usercode+'\');',function(err){
			if(err!==null && err!==undefined){
				var result = response_maker.getResponse(200,null);
				res.json(result);
				res.end();
			}else{
				var result = response_maker.getResponse(500,err);
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