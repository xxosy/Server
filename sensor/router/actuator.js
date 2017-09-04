var express = require('express');
var router = express.Router();
var connection = require('./database');

router.get('/currentstate',function(req,res){
  var serial = "PA5123";
  connection.query('select serial, currentstate from actuatorstate where serial = \''+serial+'\'',function(err,rows){
    if(rows != undefined && rows != null){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.jsonp(rows[0]);
      res.end();
    }
  });
});
router.post('/state',function(req,res){
  var state = req.body.state;
  var serial = req.body.serial;
  // console.log(serial +":"+state);
  connection.query('update actuatorstate set currentstate = \''+state+'\' where serial = \''+serial+'\'',function(err){
    connection.query('select commandstate from actuatorstate where serial = \''+serial+'\'',function(err,rows){
      if(rows != undefined && rows != null){
        var result = "$state="+rows[0].commandstate+"##";
        res.send(result);
        res.end();
      }
    });
  });
});
router.get('/commandstate',function(req,res){
  var serial = "PA5123";
  connection.query('select serial, commandstate from actuatorstate where serial = \''+serial+'\'',function(err,rows){
    if(rows != undefined && rows != null){
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.jsonp(rows[0]);
      res.end();
    }
  });
});

router.post('/state/commandstate',function(req,res){
  var state = req.body.state;
  var serial = "PA5123";
  console.log(state);
  connection.query('update actuatorstate set commandstate = \''+state+'\' where serial = \''+serial+'\'',function(err){
    connection.query('select serial, currentstate from actuatorstate where serial = \''+serial+'\'',function(err,rows){
      if(rows != undefined && rows != null){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        console.log(rows[0]);
        res.jsonp(rows[0]);
        res.end();
      }
    });
  });
});

module.exports = router;
