const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../controllers/authController');
const chat = require('../controllers/chatController');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()  + file.originalname)
    }
});

var upload = multer({ storage: storage });

router.use(auth.profileUse);

router.get('/', chat.sockets);

router.get('/:room', chat.getAllChats);

router.post('/new', chat.saveChat);

router.post('/add_chat', chat.addChat);

router.post('/add', chat.add);

router.post('/sendMessage', chat.sendMessage);

router.post('/getAllChatGroups', chat.getAllChatGroups);

router.post('/readChat', chat.readChat);

router.post('/checkRead', chat.checkRead);

router.post('/addUserToChat', chat.addUserToChat);

router.post('/uploadImage', upload.single('file'), chat.uploadImage);

module.exports = router;