"use strict";
const express = require('express');
const router = express.Router();

const media = require('../controllers/media');


/* GET home page. */
// router.get('/', desktop.home);
router.get('/example', media.example);

module.exports = router;
