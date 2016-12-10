"use strict";
let express = require('express'),
      router = express.Router(),
      user = require('../controllers/user'),
      file = require('../controllers/file'),
      auth = require('../middlewares/auth');


router.get('/files', user.vipfile);  
router.get('/files/vallay_story_audio', file.audio1);  
router.get('/files/free_internet', file.audio2); 
router.get('/files/ice_age', file.iceAge3);  
router.get('/files/therapy_pig', file.therapypig);  



module.exports = router;     