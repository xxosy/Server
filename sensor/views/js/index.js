var express = require('express');
var router = express.Router();
router.get('/management', function(req,res,next) {

    res.render('management', {
        title: 'Express',
        id:req.params.id
    });
});



router.get('/management/:id', function(req,res,next) {

    res.render('management1', {
        title: 'Express',
        id:req.params.id
    });
});

router.post('/management', function(req,res,next) {
    var access_token = req.body.access_token;

    if(access_token == '0632551113'){
        res.send("ok");
        res.end();
    }else{
        res.end();
    }
    
});

router.get('/management123', function(req,res,next) {
    res.render('access', {
        title: 'Express',
        id:req.params.id
    });
});

module.exports = router;