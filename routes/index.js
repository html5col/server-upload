"use strict";
const express = require('express');
const router = express.Router();

const main = require('../controllers/main');
const post = require('../controllers/post');

/* GET home page. */
router.get('/', post.latestTopic);
router.get('/service',main.service);
router.get('/rules',main.rules);

module.exports = router;
