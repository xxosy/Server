var express = require('express');
var router = express.Router();

router.get('/management', function(req,res,next) {
    res.render('management', {
        title: 'Express',
        access_token: '-',
        refresh_token: '-',
        id: '-'
    });
});

module.exports = router;