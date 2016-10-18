"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../middlewares/auth');

const file = require('../controllers/file');

/* GET home page. */
module.exports = function(){
      router.get('/download', file.downloadCount);
      return router;
};
