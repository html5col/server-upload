'use strict';
const config = require('../common/get-config');
const mongodb = config.db.mongo,
      logger = require('./logger');

const mongoose = require('mongoose');
mongoose.connect(mongodb.uri, mongodb.options, function(err) {
  if(err) {
     logger.error(`Mongoose default connection error: ${err.stack}`);
     process.exit(0);
  }
});

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  logger.debug('Mongoose connected...');
}); 

// If the connection throws an error
// mongoose.connection.on('error',function (err) {  
//   console.log('Mongoose default connection error: ' + err);
// }); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
// process.on('SIGINT', function() {  
//   mongoose.connection.close(function () { 
//     console.log('Mongoose default connection disconnected through app termination'); 
//     process.exit(0); 
//   }); 
// }); 

