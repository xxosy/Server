var express = require('express');
var router = express.Router();
var database = require('./database');

router.get('/:usercode/:serial/:date',function(req,res){
	var serial = req.params.serial;
	var usercode = req.params.usercode;
	var date = req.params.date;
	var connection = database.getConnection();
	connection.query('select * from journal where serial = \''+serial+
		'\' and usercode = \''+usercode+
		'\' and date = \''+date+'\';',function(err,rows){
			if(rows!==undefined){
				res.jsonp(rows);
				res.end();
			}else{
				res.end();
			}
	});
});

router.post('/:usercode/:serial/:date',function(req,res){
	var serial = req.params.serial;
	var usercode = req.params.usercode;
	var date = req.params.date;
	var condition = req.body.condition;
	var significant = req.body.significant;
		var connection = database.getConnection();
	connection.query('insert into journal(`usercode`,`serial`,`condition`,`significant`,`date`)'+
		' values(\''+usercode+'\','+
		'\''+serial+'\','+
		'\''+condition+'\','+
		'\''+significant+'\','+
		'\''+date+'\');',
		function(err){
			if(err!==undefined){
				winston.log('error','usersensor post error : '+err);
			}
		});
	res.end();
});

module.exports = router;
