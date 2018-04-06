var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');//json body parsing
var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
//external library

var schedule = require('node-schedule');//timer ex)save weather fer hour
var HashMap = require('hashmap');		//hash map ex)serial option
var winston = require('winston');		//log collector
var mime = require('mime');				//download util
var database = require('./router/database');
//router
var r_value = require('./router/value');
var r_user = require('./router/user');
var r_sensor = require('./router/sensor');
var r_scale = require('./router/scale');
var r_export_data = require('./router/export_data');
var r_journal = require('./router/journal');
var r_actuator = require('./router/actuator');
var r_camera = require('./router/camera');
var r_usersensor = require('./router/usersensor');
var r_zeropoint = require('./router/zeropoint');
var r_auth = require('./router/auth');
//module
var m_hum2hdvpd = require('./util/hum2hdvpd');
//web
var index = require('./views/js/index');

winston.add(winston.transports.File, { filename: 'IpAddress.log' });

require('date-utils');
var app = express();
var allowCrossDomain = function(req,response,next){
	response.header("Access-Control-Allow-Origin", "http://www.ezsmartfarm.com");
	response.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
	response.header("Access-Control-Allow-Credentials","true");
	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization,X-Signature");
	if ('OPTIONS' == req.method) {
	  response.sendStatus(200);
	}
	else {
	  next();
	}
}
app.use(allowCrossDomain);
var request = require('request');
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
	secret:'1234DSFs@adf1234!@#$asd',
	resave:false,
	saveUninitialized:true,
	store:new FileStore()
}));
app.set('views', path.join(__dirname, 'views/ejs'));
app.set('view engine', 'ejs');
//router setting
app.use('/value', r_value);
app.use('/user', r_user);
app.use('/sensor', r_sensor);
app.use('/export', r_export_data);
app.use('/journal', r_journal);
app.use('/actuator', r_actuator);
app.use('/scale', r_scale);
app.use('/usersensor', r_usersensor);
app.use('/camera', r_camera);
app.use('/zeropoint', r_zeropoint);
app.use('/auth', r_auth);
app.use('/',index);

var connection = database;
app.listen(3000);
console.log('Express Listening on port 3000...');