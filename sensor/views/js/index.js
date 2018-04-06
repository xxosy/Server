var express = require('express');
var router = express.Router();

const users = [
    {
        user_id: 'hyeok',
        user_nickname: '혁',
        user_pwd: '123456'
    },
    {
        user_id: 'ssladmin',
        user_nickname: '관리자',
        user_pwd: '0632551113'
    }
]

router.get('/management', function(req,res,next) {
    const sess = req.session; // 세션 객체에 접근
    var id = req.params.id;
    res.render('index', {
        nickname: sess.user_uid+1 ? users[sess.user_uid]['user_nickname'] : '',
        "id":"2"
    });
});



// router.get('/management/:id', function(req,res,next) {

//     res.render('management1', {
//         title: 'Express',
//         id:req.params.id
//     });
// });

router.get('/management/:id', (req, res) => {
    const sess = req.session; // 세션 객체에 접근
    var id = req.params.id;
    res.render('index', {
        nickname: sess.user_uid+1 ? users[sess.user_uid]['user_nickname'] : '',
        "id":id
    });
});

// router.post('/management', function(req,res,next) {
//     var access_token = req.body.access_token;

//     if(access_token == '0632551113'){
//         res.send("ok");
//         res.end();
//     }else{
//         res.end();
//     }
    
// });

router.get('/management123', function(req,res,next) {
    res.render('access', {
        title: 'Express',
        id:req.params.id
    });
});

module.exports = router;