//it's the underground for ./cache.js, which wrap the redis function
"use strict";
var config = require('../config/config');
var Redis = require('ioredis');
var logger = require('./logger');
//cost context = require('../modules/context');


   let client = new Redis({
        port: config.db.redis.production.port,
        host: config.db.redis.production.host,
        db: config.db.redis.production.db,
        password: config.db.redis.production.password,
        'ttl':config.db.redis.production.ttl,
    });



client.on('ready',function(err) {
	if(err){
	    logger.error('connect to redis error for ready , check your redis config',errr);		
	}

    logger.debug("Redis is ready");
});

client.on("connect", runSample);
//without expiration version:
// function runSample() {
//     // Set a value
//     client.set("string key", "Hello World", function (err, reply) {
//         console.log(reply.toString());
//     });
//     // Get a value
//     client.get("string key", function (err, reply) {
//         console.log(reply.toString());
//     });
// }
function runSample() {
    // Set a value with an expiration
    client.set('string key', 'Hello World', Redis.print);
    // Expire in 3 seconds
    client.expire('string key', 3);
 
    // This timer is only to demo the TTL
    // Runs every second until the timeout
    // occurs on the value
    var myTimer = setInterval(function() {
        client.get('string key', function (err, reply) {
            if(reply) {
                logger.debug('I live: ' + reply.toString());
            } else {
                clearTimeout(myTimer);
                logger.debug('I expired');
                client.quit();
            }
        });
    }, 1000);
}

client.on('error', function (err) {
  if (err) {
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});



exports = module.exports = client;
