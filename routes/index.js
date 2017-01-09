"use strict";
const express = require('express');
const router = express.Router();

const main = require('../controllers/main'),
      post = require('../controllers/post'),
      desktop = require('../controllers/desktop');


/* GET home page. */
// router.get('/', desktop.home);
router.get('/courses', desktop.home);
router.get('/', post.latestTopic);
//router.get('/', main.simpleHome);

router.get('/service',main.service);
router.get('/rules',main.rules);

module.exports = router;
