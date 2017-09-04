var express = require('express');
var router = express.Router();
var connection = require('./database');

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
	console.log("asasdsa2");
	var usercode = req.params.usercode;
	connection.query('insert into user(`usercode`) values(\''+usercode+'\');',function(err){
		res.end();
	});
});

module.exports = router;