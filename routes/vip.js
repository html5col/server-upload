"use strict";
let express = require('express'),
      router = express.Router(),
      user = require('../controllers/user'),
      file = require('../controllers/file'),
      auth = require('../middlewares/auth');


router.get('/files', user.vipfile);  
router.get('/files/vallay_story_audio', file.audio1);  

module.exports = router;     