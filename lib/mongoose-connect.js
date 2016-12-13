'use strict';
const config = require('../common/get-config');
const mongodb = config.db.mongo,
      logger = require('./logger');

const mongoose = require('mongoose');


mongoose.connect(mongodb.uri, mongodb.options, function(err) {
  if(err) {
    logger.error(err);
    process.exit(0);
  }
});

