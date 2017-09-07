var express = require('express');
var router = express.Router();
var connection = require('./database');
var winston = require('winston');

router.post('/map/sensor/:serial/:usercode',function(req,res){
	var serial = req.params.serial;
	var usercode = req.params.usercode;
	var title = req.body.title;
	var lat = req.body.lat;
	var lng = req.body.lng;

	connection.query('insert into usersensor(`serial`,`title`,`lat`,`lng`,`usercode`)'+
		' values(\''+serial+'\','+
		'\''+title+'\','+
		'\''+lat+'\','+
		'\''+lng+'\','+
		'\''+usercode+'\');',
		function(err){
			if(err!==undefined){
				winston.log('error','usersensor post error : '+err);
			}
		});
	res.end();
});
router.post('/map/weight/:weight_serial/:usercode',function(req,res){
	var weight_serial = req.params.weight_serial;
	var usercode = req.params.usercode;
	var title = req.body.title;
	var lat = req.body.lat;
	var lng = req.body.lng;

	connection.query('insert into usersensor(`weight_serial`,`title`,`lat`,`lng`,`usercode`)'+
		' values(\''+serial+'\','+
		'\''+title+'\','+
		'\''+lat+'\','+
		'\''+lng+'\','+
		'\''+usercode+'\');',
		function(err){
			if(err!==undefined){
				winston.log('error','usersensor post error : '+err);
			}
		});
	res.end();
});
router.post('/map/sensor/:serial/:weight_serial/:usercode',function(req,res){
	var weight_serial = req.params.weight_serial;
	var serial = req.params.serial;
	var usercode = req.params.usercode;
	var title = req.body.title;
	var lat = req.body.lat;
	var lng = req.body.lng;

	connection.query('insert into usersensor(`serial`,`title`,`lat`,`lng`,`usercode`,`weight_serial`)'+
		' values(\''+serial+'\','+
		'\''+title+'\','+
		'\''+lat+'\','+
		'\''+lng+'\','+
		'\''+usercode+'\','+
		'\''+weight_serial+'\');',
		function(err){
			if(err!==undefined){
				winston.log('error','usersensor post error : '+err);
			}

			var status = {
				"status" : 'ok'
			}
			res.jsonp(status);
			res.end();
		});
});

router.get('/map/sensor/:weight_serial/:usercode',function(req,res){
	var usercode = req.params.usercode;
	var weight_serial = req.params.weight_serial;
	console.log(usercode);
	connection.query('select * from usersensor where usercode = \''+usercode+'\' and weight_serial = \''+weight_serial+'\';',function(err,rows){
		if(rows!==undefined){
			if(!rows.length){
				res.status(200);
				res.end();
			}else{
				res.jsonp(rows);
			}
		}else{
			res.status(200);
			res.end();
		}
		if(err!==undefined){
			winston.log('error','usersensor get error : '+err);
		}
	});
});
router.get('/:usercode',function(req,res){
	var usercode = req.params.usercode;
	console.log(usercode);
	connection.query('select user.name, user.code as usercode, sensor.serial, sensor.lat, sensor.lng from usersensor '+
		'inner join user on usersensor.user_id = (select id from user where user.code = \''+usercode+'\') '+
		'inner join sensor on sensor.id = usersensor.sensor_id;',function(err,rows){
			if(rows!==undefined){
				if(!rows.length){
					res.status(200);
					res.end();
				}else{
					res.jsonp(rows);
				}
			}else{
				res.status(200);
				res.end();
			}
			if(err!==undefined){
				winston.log('error','usersensor get error : '+err);
			}
		});
});
router.get('/map/delete/:serial/:usercode',function(req,res){
	var usercode = req.params.usercode;
	var serial = req.params.serial;

	connection.query('delete from usersensor where (usercode = \''+usercode+'\' and serial = \''+serial+
		'\') or (usercode = \''+usercode+'\' and weight_serial = \''+serial+'\');',function(err){
			if(err!==undefined){
				winston.log('error','usersensor delete error : '+err);
				var status = {
					"status" : 'ok'
				}
				res.jsonp(status);
				res.end();
			}
		});
});
router.put('/map/sensor/:serial/:usercode',function(req,res){
	var usercode = req.params.usercode;
	var serial = req.params.serial;
	var title = req.body.title;
	var lat = req.body.lat;
	var lng = req.body.lng;

	connection.query('update usersensor set `title` =\''+title
		+'\', `lat`=\''+lat
		+'\', `lng`=\''+lng+'\' where usercode = \''+usercode+'\' and serial = \''+serial+'\';',function(err){
			if(err!==undefined){
				winston.log('error','usersensor put error : '+err.code);
			}
		});
	res.end();
});
router.get('/camera/list/url',function(req,res){
	connection.query('select distinct url from sensor where url is not null and url != \'\';',function(err,rows){
		if(rows!==undefined){
			if(!rows.length){
				res.status(404).send('Not find url');
				res.end();
			}else{
				res.jsonp(rows);
			}
		}else{
			res.status(404).send('Not find sensor usercode : ' +usercode);
			res.end();
		}
		if(err!==undefined){
			winston.log('error','find camera url : '+err);
		}
	});
});
router.get('/camera/list/mosquito',function(req,res){
	connection.query('select distinct mosquito_url from sensor where mosquito_url is not null;',function(err,rows){
		if(rows!==undefined){
			if(!rows.length){
				res.status(404).send('Not find mosquito_url');
				res.end();
			}else{
				res.jsonp(rows);
			}
		}else{
			res.status(404).send('Not find mosquito_url');
			res.end();
		}
		if(err!==undefined){
			winston.log('error','find mosquito_url : '+err);
		}
	});
});


module.exports = router;