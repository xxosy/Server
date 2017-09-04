var express = require('express');
var router = express.Router();
var HashMap = require('hashmap');
var recentHash = new HashMap();
require('date-utils');

router.post('/weight',function(req,res){
	var serial = req.body.serial;
	var weight1 = req.body.weight1;
	var weight2 = req.body.weight2;

	var date = new Date();
	var update_date = date.toFormat('YYYYMMDD');
	var update_time = date.toFormat('HH24:MI:SS');
	var recent = {
		"update_date" : update_date,
		"update_time" : update_time,
		"serial_id" : serial,
		"value" : weight1,
		"liquid" : weight2
	}
	recentHash.set(serial,recent);
});

router.get('/weight/recent/serial/:serial',function(req,res){
	var serial = req.params.serial;
	connection.query('select id from scale where serial = \''+serial+'\';',function(err,rows){
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
						"value" : temp.value,
						"liquid" : temp.liquid
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