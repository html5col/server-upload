// app/routes.js
"use strict";
const user = require('./routes/user'),
      test = require('./routes/test'),
	  respond = require('./routes/respond'),
	  login3 = require('./routes/login3'),
	  index = require('./routes/index'),
	  //api = require('./routes/api'),
	  post = require('./routes/post'),
	  group = require('./routes/group'),
	  vip = require('./routes/vip'),
	  auth = require('./middlewares/auth'),
	  file = require('./routes/file');



const adminUsers = require('./routes/backend/user');

module.exports   = function(app, passport,User) {
	 app.use('/',index);  
	 app.use('/response',respond);   
	 app.use('/user',user(User,passport));
	 //app.use('/api',api);
	 app.use('/auth',login3);
     app.use('/post', post());
	 //app.use('/test',test);
	 app.use('/group',group());
	 app.use('/file',file());
	 app.use('/admin', auth.allow(['Super','Junior']),adminUsers);
	 app.use('/vip',vip);
		//to get form data using req.body
		/*****form part end********/
};
