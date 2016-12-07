"use strict";
const express = require('express');
const router = express.Router();

const desktop = require('../controllers/desktop'),
      user = require('../controllers/user'),
      auth = require('../middlewares/auth');

/* GET home page. */
//router.get('/', desktop.home);
router.get('/t2h', desktop.t2h);
router.get('/speakdaily', desktop.speakdaily)
router.get('/t2a', desktop.t2a);
router.get('/questions', desktop.questions);
router.get('/signup', desktop.signup);
router.get('/login', desktop.login);
router.get('/applyForTutor', desktop.applyForTutor);
router.post('/applyForTutor', desktop.tutorUpload);
router.get('/book', desktop.book);
router.post('/book', desktop.bookUpload);
router.get('/classifiedCode', desktop.classfiedCode);
router.post('/classifiedCode', desktop.classfiedCoded);
module.exports = router;
