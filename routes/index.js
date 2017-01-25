"use strict";
const express = require('express');
const router = express.Router();

const main = require('../controllers/main'),
      post = require('../controllers/post'),
      desktop = require('../controllers/desktop');


/* GET home page. */
 router.get('/', function(req,res){
     res.json('网站正在备案中...');
 });
router.get('/courses', desktop.home);
//router.get('/', post.latestTopic);
//router.get('/', main.simpleHome);
router.get('/posts', post.latestTopic);

router.get('/service',main.service);
router.get('/rules',main.rules);

module.exports = router;
