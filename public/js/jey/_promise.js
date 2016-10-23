var jey = jey || {};

(function(){
    jey.prototype = {
     /**
     *  setTimeout Promise
     * @param {ms}: millionseconds
     *      * usage: 
        delay(5000).then(function () { // (B)
            console.log('5 seconds have passed!')
        });
     * Notice: we can call resolve with zero parameters, which is the same as calling resolve(undefined) if We don’t need the fulfillment value. 
     */        
        delay: function(ms) {
            return new Promise(function (resolve, reject) {
                setTimeout(resolve, ms); // (A)
            });
        },


    /**
     *  mock ajax get method
     * @param {url}: a url
     * usage: 
     *   httpGet('http://example.com/file.txt')
     *              .then(
     *                    function (value) {
     *                      console.log('Contents: ' + value);
     *                 },
     *                function (reason) {
     *                   console.error('Something went wrong', reason);
     *                });
     */     
      get: function(url){
            return new Promise(
                function (resolve, reject) {
                    const request = new XMLHttpRequest();
                    request.onload = function () {
                        if (this.status === 200) {
                            // Success
                            resolve(this.response);
                        } else {
                            // Something went wrong (404 etc.)
                            reject(new Error(this.statusText));
                        }
                    };
                    request.onerror = function () {
                        reject(new Error(
                            'XMLHttpRequest Error: '+this.statusText));
                    };
                    request.open('GET', url);
                    request.send();
            });   
      },
    /**
     *   timing out a Promise
     * @param {ms}: millionseconds
     * @param {promise}: a promise
     * usage: 
            timeout(5000, httpGet('http://example.com/file.txt'))
            .then(function (value) {
                console.log('Contents: ' + value);
            })
            .catch(function (reason) {
                console.error('Error or timeout', reason);
            });
     * Tip: Note that the rejection after the timeout (in line A) does not cancel the request, but it does prevent the Promise being fulfilled with its result.
     */ 
      timeout: function(ms, promise) {
            return new Promise(function (resolve, reject) {
                promise.then(resolve);
                setTimeout(function () {
                    reject(new Error('Timeout after '+ms+' ms')); // (A)
                }, ms);
            });
     },      

/*
*how to use: from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
// B-> Here you define its functions and its payload
// var mdnAPI = 'https://developer.mozilla.org/en-US/search.json';
// var payload = {
//   'topic' : 'js',
//   'q'     : 'Promise'
// };

// var callback = {
//   success: function(data) {
//     console.log(1, 'success', JSON.parse(data));
//   },
//   error: function(data) {
//     console.log(2, 'error', JSON.parse(data));
//   }
// };
// End B

// // Executes the method call 
// $http(mdnAPI) 
//   .get(payload) 
//   .then(callback.success) 
//   .catch(callback.error);

// // Executes the method call but an alternative way (1) to handle Promise Reject case 
// $http(mdnAPI) 
//   .get(payload) 
//   .then(callback.success, callback.error);

// // Executes the method call but an alternative way (2) to handle Promise Reject case 
// $http(mdnAPI) 
//   .get(payload) 
//   .then(callback.success)
//   .then(undefined, callback.error);
*/
   // A-> $http function is implemented in order to follow the standard Adapter pattern
    http: function(url){
        
        // A small example of object
        var core = {
            // Method that performs the ajax request
            ajax: function (method, url, args) {

            // Creating a promise
            var promise = new Promise( function (resolve, reject) {

                // Instantiates the XMLHttpRequest
                var client = new XMLHttpRequest();
                var uri = url;

                if (args && (method === 'POST' || method === 'PUT')) {
                uri += '?';
                var argcount = 0;
                for (var key in args) {
                    if (args.hasOwnProperty(key)) {
                    if (argcount++) {
                        uri += '&';
                    }
                    uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                    }
                }
                }

                client.open(method, uri);
                client.send();

                client.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    // Performs the function "resolve" when this.status is equal to 2xx
                    resolve(this.response);
                } else {
                    // Performs the function "reject" when this.status is different than 2xx
                    reject(this.statusText);
                }
                };
                client.onerror = function () {
                reject(this.statusText);
                };
            });

            // Return the promise
            return promise;
            }
        };

        // Adapter pattern
        return {
            'get': function(args) {
            return core.ajax('GET', url, args);
            },
            'post': function(args) {
            return core.ajax('POST', url, args);
            },
            'put': function(args) {
            return core.ajax('PUT', url, args);
            },
            'delete': function(args) {
            return core.ajax('DELETE', url, args);
            }
        };
    },



    };
})();

