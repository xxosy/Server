var mysql = require('mysql');			//mysql - database
require('date-utils');
var connection;
function handleDisconnect(){
	connection = mysql.createConnection({
		host : 'localhost',
		port : 3306,
		user : 'root',
		password : 'admin',
		database : 'paisdb'
		
	});

	connection.connect(function(err){
		if(err){
			console.log('error when connection to db :',err);
			setTimeout(handleDisconnect,2000);
		}
	});

	connection.on('error',function(err){
		console.log('db error',err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			var date = new Date();			
			var update_time=date.toFormat('HH24:MI');
			var update_date=date.toFormat('YYYY-MM-DD');
			console.log("connection lost"+update_date+update_time);
			handleDisconnect();
		}else{
			throw err;
		}
	});
	var date = new Date();	
	var update_time=date.toFormat('HH24:MI');
	var update_date=date.toFormat('YYYY-MM-DD');
	console.log("CONNECT DATABASE AT "+update_date+update_time);
}
handleDisconnect();
module.exports = connection;