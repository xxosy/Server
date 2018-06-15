var express = require('express');
var router = express.Router();
var database = require('./database');
var m_hum2hdvpd = require('../util/hum2hdvpd');
var json2csv = require('json2csv');		//parsing json to csv
var fs = require('fs');					//file system

router.get('/excel/all/:serial/:date',function(req,res){
	var serial = req.params.serial;
	var update_date = new Date(req.params.date);
	update_date = update_date.toFormat('YYYY-MM-DD');
	var connection = database.getConnection();
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,temperature_ds,humidity,co2,ec,ph,light,update_date,update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date = \''
					+update_date+'\' and update_time between \'00:00\' and \'23:59\';',function(err,rows){
						var datas = new Array(rows.length);
						for(var i =0;i<rows.length;i++){
							var item = rows[i];

							var temp = item.temperature*1;
							var humi = item.humidity*1;
							var wet_temp = m_hum2hdvpd.getWetTemperature(temp,1013,humi);
							var dew = m_hum2hdvpd.getDEW(temp,wet_temp,1013);
							var hd = m_hum2hdvpd.getHD(humi,temp);
							var vpd = m_hum2hdvpd.getVPD(temp,wet_temp,1013,humi);
							var data = {
								"id" : rows[i].id,
								"temperature" : item.temperature,
								"humidity" : item.humidity,
								"light":item.light,
								"co2":item.co2,
								"ec":item.ec,
								"ph":item.ph,
								"wet_temp" : wet_temp,
								"dew" : dew,
								"hd" : hd,
								"vpd" : vpd,
								"update_time" : rows[i].update_time,
							}
							datas[i] = data;
						}
						var fields = ['id','temperature','humidity','light','co2','ec','ph' ,'wet_temp','dew','hd','vpd' , 'update_time'];
						var myDatas = datas;
						
						var csv = json2csv({ data: myDatas, fields: fields });
						  // console.log(csv);
						fs.writeFile('../sensor/export_data/'+serial+'_'+update_date+'_all.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file ='../sensor/export_data/'+serial+'_'+update_date+'_all.csv';
							res.download(file);
						});
					});
			}
		}
	});
});


router.get('/excel/all/:serial/start/:start/end/:end',function(req,res){
	var serial = req.params.serial;
	var start = new Date(req.params.start);
	var end = new Date(req.params.end);
	end = end.toFormat('YYYY-MM-DD');
	start = start.toFormat('YYYY-MM-DD');
	var connection = database.getConnection();
	connection.query('select id from sensor where serial =\''+serial+'\';',function(err,rows){
		if(err!==null){
			res.end();
		}else{
			if(!rows.length){
				res.status(404).send('NOT find list for serial : '+serial);
				res.end();
			}else{
				var sensor_id = rows[rows.length-1].id;
				connection.query('select id,temperature,temperature_ds,humidity,co2,ec,ph,light,update_date,update_time from value where sensor_id=\''
					+sensor_id+'\' and update_date between \''
					+start+'\' and \''+end+'\';',function(err,rows){
						var datas = new Array(rows.length);
						for(var i =0;i<rows.length;i++){
							var item = rows[i];

							var temp = item.temperature*1;
							var humi = item.humidity*1;
							var wet_temp = m_hum2hdvpd.getWetTemperature(temp,1013,humi);
							var dew = m_hum2hdvpd.getDEW(temp,wet_temp,1013);
							var hd = m_hum2hdvpd.getHD(humi,temp);
							var vpd = m_hum2hdvpd.getVPD(temp,wet_temp,1013,humi);
							var data = {
								"id" : rows[i].id,
								"temperature" : item.temperature,
								"humidity" : item.humidity,
								"light":item.light,
								"co2":item.co2,
								"ec":item.ec,
								"ph":item.ph,
								"wet_temp" : wet_temp,
								"dew" : dew,
								"hd" : hd,
								"vpd" : vpd,
								"update_time" : rows[i].update_date,
								"update_time" : rows[i].update_time,
							}
							datas[i] = data;
						}
						var fields = ['id','temperature','humidity','light','co2','ec','ph' ,'wet_temp','dew','hd','vpd' , 'update_date','update_time'];
						var myDatas = datas;
						
						var csv = json2csv({ data: myDatas, fields: fields });
						  // console.log(csv);
						fs.writeFile('../sensor/export_data/'+serial+'_'+start+'_'+end+'_all.csv', csv, function(err) {
							if (err) throw err;
							console.log('file saved');

							var file ='../sensor/export_data/'+serial+'_'+start+'_'+end+'_all.csv';
							res.download(file);
						});
					});
			}
		}
	});
});
module.exports = router;