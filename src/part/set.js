"use strict";
const config = require('../common/get-config');
module.exports = function(app){
	app.set('port',process.env.PORT || config.port);
	//process.env.NODE_ENV or app.get('env')
	//app.set('env','production');
	//app.set('env','development');
    //app.set('view engine',__dirname + '/views');
    return app;    
};