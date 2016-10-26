"use strict";
(function(){
    var possiblyUnhandledRejections = new Map();

    // when a rejection is unhandled, add it to the map
    window.onunhandledrejection = function(event) {
        possiblyUnhandledRejections.set(event.promise, event.reason);
    };

    window.onrejectionhandled = function(event) {
        possiblyUnhandledRejections.delete(event.promise);
    };

    setInterval(function() {

        possiblyUnhandledRejections.forEach(function(reason, promise) {
            console.log(reason.message ? reason.message : reason);
            function handleRejection(prm,err){
                console.log('there is some error in promise function: '+ prm+ ' whose reason is '+ err);
                return;
            }
            // do something to handle these rejections
            handleRejection(promise, reason);
        });

        possiblyUnhandledRejections.clear();

    }, 60000);    
}());