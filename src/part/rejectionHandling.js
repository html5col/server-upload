"use strict";
const logger = require('../lib/logger');
module.exports.rejectHandling = function () {
    let possiblyUnhandledRejections = new Map();

    // when a rejection is unhandled, add it to the map
    process.on("unhandledRejection", function(reason, promise) {
        possiblyUnhandledRejections.set(promise, reason);
    });

    process.on("rejectionHandled", function(promise) {
        possiblyUnhandledRejections.delete(promise);
    });

    setInterval(function() {
        possiblyUnhandledRejections.forEach(function(reason, promise) {
            logger.error(reason.message ? reason.message : reason);
            function handleRejection(prm,err){
                logger.error(`there is some error in promise function: ${prm} whose reason is ${err}`);
                return;
            }
            // do something to handle these rejections
            handleRejection(promise, reason);
        });

        possiblyUnhandledRejections.clear();

    }, 60000);
};


//from: https://leanpub.com/understandinges6/read#leanpub-auto-nodejs-rejection-handling
//In Node.js, there are two events on the process object related to promise rejection handling: unhandledRejection and rejectionHandled
//This is a simple unhandled rejection tracker. It uses a map to store promises and their rejection reasons. Each promise is a key, and the promise’s reason is the associated value. Each time unhandledRejection is emitted, the promise and its rejection reason are added to the map. Each time rejectionHandled is emitted, the handled promise is removed from the map. As a result, possiblyUnhandledRejections grows and shrinks as events are called. The setInterval() call periodically checks the list of possible unhandled rejections and outputs the information to the console (in reality, you’ll probably want to do something else to log or otherwise handle the rejection). A map is used in this example instead of a weak map because you need to inspect the map periodically to see which promises are present, and that’s not possible with a weak map.
