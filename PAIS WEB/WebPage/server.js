var fs = require('fs');
var express = require('express');
var moment = require('moment');
var app = express();


var port = 3000;
app.listen(port);

app.get('/', function(req, res){
/*
  fs.readFile('html/index.html', 'utf8', function(error, data){
    if(error){
      consoleLog("html read fail");
      res.end("html read fail");
    } else {
      res.writeHead(200, {'Content-Type' : 'text/html'});
      res.end(data);
    }
  });*/

  res.render('html/index.html');
});


function consoleLog(log) {
	console.log('[' + moment().format('YYYY-MM-DD hh:mm:ss') + '] ' + log);
}
