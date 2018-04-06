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

const findUser = (user_id, user_pwd) => {
    // id와 password가 일치하는 유저 찾는 함수, 없으면 undefined 반환
    return users.find( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}
const findUserIndex = (user_id, user_pwd) => {
    // 일치하는 유저의 index값(유니크) 반환
    return users.findIndex( v => (v.user_id === user_id && v.user_pwd === user_pwd) );
}

router.get('/', (req, res) => {
    const sess = req.session; // 세션 객체에 접근
    res.render('index', {
        nickname: sess.user_uid+1 ? users[sess.user_uid]['user_nickname'] : ''
    });
});

router.get('/login', (req, res) => {
    res.render('login'); // login.ejs 랜더링
});
router.post('/login', (req, res) => {
    const body = req.body; // body-parser 사용
    if( findUser( body.user_id, body.user_pwd ) ) {
    // 해당유저가 존재한다면
        req.session.user_uid = findUserIndex( body.user_id, body.user_pwd ); //유니크한 값 유저 색인 값 저장
        res.redirect('/management');
    } else {
        res.send('유효하지 않습니다.');
    }
});
router.get('/user', (req, res) => {
    console.log(req.session);
});
router.get('/logout', (req, res) => {
    delete req.session.user_uid;
    res.redirect('/management');
});


module.exports = router;