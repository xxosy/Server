var express = require('express');
var router = express.Router();
var connection = require('./database');

router.get('/excel/factor/:factor/:serial/:date',function(req,res){
	var crypto = require('crypto');
	var factor = req.params.factor;
	var serial = req.params.serial;
	var update_date = new Date(req.params.date);
	update_date = update_date.toFormat('YYYY-MM-DD');
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			console.log(factor+' list err ' + err);
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,'+factor+',update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date = \''
					+update_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						for(var i =0;i<rows.length;i++){
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i][factor],'hex','utf8');
							dec += decipher.final('utf8');
							rows[i][factor] = dec;
						}
						var fields = ['id', factor, 'update_time'];
						var myCars = rows;
						var csv = json2csv({ data: myCars, fields: fields });
						 // console.log(csv);

						fs.writeFile(__dirname+'/export_data/'+serial+'_'+update_date+'.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file = __dirname + '/export_data/'+serial+'_'+update_date+'.csv';
							res.download(file);
						});
					});
			}
		}
	});
});

router.get('/excel/all/:serial/:date',function(req,res){
	var crypto = require('crypto');
	var serial = req.params.serial;
	var update_date = new Date(req.params.date);
	update_date = update_date.toFormat('YYYY-MM-DD');
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,humidity,light,co2,ec,ph,update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date = \''
					+update_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						var datas = new Array(rows.length);
						for(var i =0;i<rows.length;i++){
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].temperature,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].temperature = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].humidity,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].humidity = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].light,'hex','utf8');
							dec += decipher.final('utf8');
							var templight = dec;
							dec = dec*1;
							dec = dec*2.7;
							rows[i].light = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].co2,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].co2 = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].ec,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].ec = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].ph,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].ph = dec;


							var temp = rows[i].temperature*1;
							var humi = rows[i].humidity*1;
							var wet_temp = m_hum2hdvpd.getWetTemperature(temp,1013,humi);
							var dew = m_hum2hdvpd.getDEW(temp,wet_temp,1013);
							var hd = m_hum2hdvpd.getHD(humi,temp);
							var vpd = m_hum2hdvpd.getVPD(temp,wet_temp,1013,humi);
							var data = {
								"id" : rows[i].id,
								"temperature" : rows[i].temperature,
								"humidity" : rows[i].humidity,
								"light":rows[i].light,
								"co2":rows[i].co2,
								"ec":rows[i].ec,
								"ph":rows[i].ph,
								"wet_temp" : wet_temp,
								"dew" : dew,
								"hd" : hd,
								"vpd" : vpd,
								"update_time" : rows[i].update_time,
							}
							datas[i] = data;
						}
						var fields = ['id','temperature','humidity','light','co2','ec','ph' ,'wet_temp','dew','hd','vpd' , 'update_time'];
						var myCars = datas;
						
						var csv = json2csv({ data: myCars, fields: fields });
						  // console.log(csv);

						fs.writeFile(__dirname+'/export_data/'+serial+'_'+update_date+'_all.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file = __dirname + '/export_data/'+serial+'_'+update_date+'_all.csv';
							res.download(file);
						});
					});
			}
		}
	});
});


router.get('/excel/all/:serial/:startdate/:enddate',function(req,res){
	var crypto = require('crypto');
	var serial = req.params.serial;
	var start_date = new Date(req.params.startdate);
	var end_date = new Date(req.params.enddate);
	start_date = start_date.toFormat('YYYY-MM-DD');
	end_date = end_date.toFormat('YYYY-MM-DD');
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,humidity,light,co2,ec,ph,update_time,update_date from value where sensor_id=\''
					+sensor_id+'\' and update_date between \''
					+start_date+'\'and \''+end_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						
						for(var i =0;i<rows.length;i++){
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].temperature,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].temperature = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].humidity,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].humidity = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].light,'hex','utf8');
							dec += decipher.final('utf8');

							var templight = dec;
							dec = dec*1;
							dec = dec*2.7;
							rows[i].light = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].co2,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].co2 = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].ec,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].ec = dec;

							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].ph,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].ph = dec;
						}
						var fields = ['id','temperature','humidity','light','co2','ec','ph' , 'update_time','update_date'];
						var myCars = rows;
						
						var csv = json2csv({ data: myCars, fields: fields });
						  // console.log(csv);

						fs.writeFile(__dirname+'/export_data/'+serial+'_'+start_date+'_'+end_date+'_all.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file = __dirname + '/export_data/'+serial+'_'+start_date+'_'+end_date+'_all.csv';
							res.download(file);
						});
					});
			}
		}
	});
});
router.get('/excel/humidity/:serial/:date',function(req,res){
	var crypto = require('crypto');
	var serial = req.params.serial;
	var update_date = new Date(req.params.date);
	update_date = update_date.toFormat('YYYY-MM-DD');
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,humidity,update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date = \''
					+update_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						var datas = new Array(rows.length);
						for(var i =0;i<rows.length;i++){
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].temperature,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].temperature = dec;
							
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].humidity,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].humidity = dec;
							var temp = rows[i].temperature*1;
							var humi = rows[i].humidity*1;
							var wet_temp = m_hum2hdvpd.getWetTemperature(temp,1013,humi);
							var dew = m_hum2hdvpd.getDEW(temp,wet_temp,1013);
							var hd = m_hum2hdvpd.getHD(humi,temp);
							var vpd = m_hum2hdvpd.getVPD(temp,wet_temp,1013,humi);
							var data = {
								"id" : rows[i].id,
								"temperature" : rows[i].temperature,
								"humidity" : rows[i].humidity,
								"wet_temp" : wet_temp,
								"dew" : dew,
								"hd" : hd,
								"vpd" : vpd,
								"update_time" : rows[i].update_time,
							}
							datas[i] = data;
						}
						

						var fields = ['id','temperature','humidity','wet_temp','dew','hd','vpd' , 'update_time'];

						var myCars = datas;
						
						var csv = json2csv({ data: myCars, fields: fields });
						  // console.log(csv);

						fs.writeFile(__dirname+'/export_data/'+serial+'_'+update_date+'_humidity.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file = __dirname + '/export_data/'+serial+'_'+update_date+'_humidity.csv';
							res.download(file);
						});
					});
			}
		}
	});
});
router.get('/excel/humidity/:serial/:startdate/:enddate',function(req,res){
	var crypto = require('crypto');
	var serial = req.params.serial;
	var start_date = new Date(req.params.startdate);
	start_date = start_date.toFormat('YYYY-MM-DD');
	var end_date = new Date(req.params.enddate);
	end_date = end_date.toFormat('YYYY-MM-DD');
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,humidity,update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date between \''
					+start_date+'\'and \''+end_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						var datas = new Array(rows.length);
						for(var i =0;i<rows.length;i++){
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].temperature,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].temperature = dec;
							
							var decipher = crypto.createDecipher('aes-128-ecb','pais');
							var dec = decipher.update(rows[i].humidity,'hex','utf8');
							dec += decipher.final('utf8');
							rows[i].humidity = dec;

							var temp = rows[i].temperature*1;
							var humi = rows[i].humidity*1;
							var wet_temp = m_hum2hdvpd.getWetTemperature(temp,1013,humi);
							var dew = m_hum2hdvpd.getDEW(temp,wet_temp,1013);
							var hd = m_hum2hdvpd.getHD(humi,temp);
							var vpd =m_hum2hdvpd.getVPD(temp,wet_temp,1013,humi);
							var data = {
								"id" : rows[i].id,
								"temperature" : rows[i].temperature,
								"humidity" : rows[i].humidity,
								"wet_temp" : wet_temp,
								"dew" : dew,
								"hd" : hd,
								"vpd" : vpd,
								"update_time" : rows[i].update_time,
							}
							datas[i] = data;
						}
						

						var fields = ['id','temperature','humidity','wet_temp','dew','hd','vpd' , 'update_time'];

						var myCars = datas;
						
						var csv = json2csv({ data: myCars, fields: fields });
						  // console.log(csv);

						fs.writeFile(__dirname+'/export_data/'+serial+'_'+start_date+'_'+end_date+'_humidity.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file = __dirname + '/export_data/'+serial+'_'+start_date+'_'+end_date+'_humidity.csv';
							res.download(file);
						});
					});
			}
		}
	});
});

module.exports = router;