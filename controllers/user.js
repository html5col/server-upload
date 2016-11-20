"use strict";
const flash = require('connect-flash'),
    config  = require('../config/config'),
	seo = require('../config/seo'),
    mailService  = require('../lib/email')(config),
    bodyParser   = require('body-parser'),
    formidable = require('formidable'),
    crypto = require('crypto'),
    moment = require('moment'),
    path = require('path'),
    fs = require('fs'),
	helper = require('../lib/utility'),
	Post = require('../models/Post'),
	User = require('../models/User'),
	logger = require('../lib/logger'),
	postProxy = require('../db_proxy/post'),
	userProxy = require('../db_proxy/user'),
    validator = require('validator'),
    xss = require('xss');

module.exports = {

	    vipfile: (req,res)=>{
			res.render('vip/resourses',{
				title:seo.vip.download.title,
				keywords:seo.vip.download.keywords,
				description:seo.vip.download.description,						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,				
			});
		},

		hotUsers: (req,res)=>{
			User.find({
				//'local.contractMoney': { $gt: 0,$lt: 100000},
				'local.roles': { $in: ['Trial', 'Yearly'] },
				//'local.email': { $ne: '631738796@qq.com'}
				//'local.neVip': false,
				//'local.neVip': {$ne: 'true'},
			}).
			//ne({ 'local.email': '631738796@qq.com' }).
			sort({ 'local.successCount': -1 }).
			sort({ 'local.contractMoney': -1 }).
			//limit(8).
			exec(function(err, users){
				if(err){
					logger.error(`err when find hotUser: ${err.stack}`);
					req.flash('error', 'Error finding users!');
					res.redirect('back');
				}else{
					if(users == []){
						req.flash('error','No user found!');
						res.redirect('back');
					}
					let modifiedUsers = userProxy.modifyUsers(users); 
					require('../part/countTime').countTime(modifiedUsers);	

                    User.find({
						'local.roles': { $in: ['Trial', 'Yearly'] },
						'local.email': { $ne: '631738796@qq.com'}
					}).
					//select('local.contractMoney local.').
					exec(function(err,vips){
							let sum = 0,rewards,contractLeftSum = 0;
							//contractLeftSum = 0;
							//let rewardsFromNow;
							
							
							for(let i=0;i<vips.length;i++){
								//let charge;
								
								let user = vips[i].processUser(vips[i]);
								let contractMoney =user.contractMoney;
								logger.debug('contractMoney is'+contractMoney);
								if(user.latestRole == 'Yearly'){
									//charge = 588;
									sum = sum + 588;
								}else if(user.latestRole == 'Trial'){
									//charge = 99;
									sum = sum + 99;
								}
								
								contractLeftSum = contractLeftSum + contractMoney;						
							}
							logger.debug(`contractLeftSum sould be ${contractLeftSum}, sum ${sum}`);
							if(sum < 0){
								logger.debug('no money to calculate for');
								return;
							}
							rewards = 171.7 + 0.2*(sum - contractLeftSum);
							vips.forEach(function(theuser){
								theuser.local.rewards = rewards;
								theuser.save(function(errr,user){
									if(err){
										logger.error(`error saving the user : ${err}`);
										return;
									}
									logger.debug(`save rewards successfully!`);
								});	
							});
							logger.debug(`sum - contractLeftSum sould be ${sum - contractLeftSum}`);
							logger.debug(`the rewards in the db sould be ${rewards}`);	

							let options = {
								title:seo.user.hotUsers.title,
								keywords:seo.user.hotUsers.keywords,
								description:seo.user.hotUsers.description,						
								messages: {
									error: req.flash('error'),
									success: req.flash('success'),
									info: req.flash('info'),
								}, 
								vips: modifiedUsers,
								rewards: vips[0].local.rewards,
								user: req.user ? req.user.processUser(req.user) : req.user,				
							};					
							res.render('users/hotUsers',options);

					});
	
				}			

				
			});

		},

		// hotUser: (req,res)=>{
		// 	//let vip = false;
		// 	User.find({},function(err,users){
		// 		if(err){
		// 			logger.error(`err when find hotUser: ${err.stack}`);
		// 			req.flash('error', 'Error finding users!');
		// 			res.redirect('back');
		// 		}
		// 		// let vipUsers = [];	
		// 		// users.forEach(function(user){
		// 		// 	let modifiedUser = user.processUser(user);
		// 		// 	modifiedUser.isVip = false;
		// 		// 	if(user.local.roles[0]){
		// 		// 		modifiedUser.isVip = true;
		// 		// 		vipUsers.push(modifiedUser);
		// 		// 	}
		// 		// });
		// 		res.render('users/hotUsers',{
		// 					title:seo.user.hotUsers.title,
		// 					keywords:seo.user.hotUsers.keywords,
		// 					description:seo.user.hotUsers.description,						
		// 					messages: {
		// 						error: req.flash('error'),
		// 						success: req.flash('success'),
		// 						info: req.flash('info'),
		// 					}, 
		// 					vips: vipUsers,
		// 					user: req.user ? req.user.processUser(req.user) : req.user,

		// 		});


		// 	});


		// },
		signup: (req,res)=>{
					//render the page and pass in any flash data if it exists, req.flash is provided by connect-flash
				    res.render('form/signup', { 

						title:seo.user.signup.title,
						keywords:seo.user.signup.keywords,
						description:seo.user.signup.description,						
			            messages: {
			            	error: req.flash('error'),
			            	success: req.flash('success'),
			            	info: req.flash('info'),
			            }, 
				    	user: req.user ? req.user.processUser(req.user) : req.user,
				    });
		},
		login: (req,res)=>{
					//render the page and pass in any flash data if it exists
				    res.render('form/login', { 

						title:seo.user.login.title,
						keywords:seo.user.login.keywords,
						description:seo.user.login.description,							
			            messages: {
			            	error: req.flash('error'),
			            	success: req.flash('success'),
			            	info: req.flash('info'),
			            }, 
				    	user: req.user ? req.user.processUser(req.user) : req.user,
				    });
		},
		fileupload: (req,res)=>{
				    var now = new Date();
				    res.render('form/fileupload', {

						title:seo.user.logoUpload.title,
						keywords:seo.user.logoUpload.keywords,
						description:seo.user.logoUpload.description,							
			            messages: {
			            	error: req.flash('error'),
			            	success: req.flash('success'),
			            	info: req.flash('info'),
			            },		    	
				        year: now.getFullYear(),
				        month: now.getMonth(),//0-11
				        user: req.user ? req.user.processUser(req.user) : req.user,
			            
				    });
		},
		profile: (req, res)=> {
				    const user_id = req.params.user_id,
					      page = req.query.p ? parseInt(req.query.p) : 1;
					logger.debug('user_id is in proifle function'+user_id);

					postProxy.getPostsByUserId(req,res,user_id,function(posts,count){
						   // logger.debug("profile posts and count:" ,posts,count);
							let loginedUser;
							if(req.user){
								loginedUser = req.user.processUser(req.user);
							}
						
							userProxy.getUserById(user_id, theuser=>{ 
							     	let postUser = req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser;
									 let isProfile = true;
									 logger.debug('postUser in profle-getUserbyid'+JSON.stringify(postUser));

									// for fixed vip money: not contract money
									// let vip = postUser.vip;   
									// let date  = new Date();
									// let vipTimeLeft,fdate,difference;

									// if(vip = 'Trial'){
									//         fdate  = new Date();
									//         fdate.setDate(09);
									//         fdate.setMonth(11);//need to be added by 1
									//         fdate.setFullYear(2016);
									//         if(date.getTime()<fdate.getTime()){
									//             difference = fdate.getTime() - date.getTime();
									//             postUser.vipTimeLeft = Math.floor(difference / (1000*60*60*24));
									//         }             
									// }else if(vip = 'Yearly'){
									//         fdate  = new Date();
									//         fdate.setDate(9);
									//         fdate.setMonth(7);
									//         fdate.setFullYear(2017);
									//         if(date.getTime()<fdate.getTime()){
									//             difference = fdate.getTime()-date.getTime();
									//             postUser.vipTimeLeft = Math.floor(difference / (1000*60*60*24));
									//         }                
									// }else if(vip = 'Super'){
									//     postUser.vipTimeLeft = 'Infinite';
									// }
									// logger.debug(difference);


									let contractLeft = Number(postUser.contractMoney);   
									//let vip = postUser.vip; 
									
									let latestRole = postUser.latestRole;
									let yearlyCharge = config.yearlyCharge;
									let contractPerMonth;
									let needMoney = false;
									if(latestRole == 'Yearly'){
										contractPerMonth = yearlyCharge/8;
									}else if(latestRole == 'Trial'){
										contractPerMonth = 99;
									}

									    
									let monthLeft = Math.floor(contractLeft/contractPerMonth);

								    if(monthLeft == 0){
										needMoney = true;
										postUser.needMoney = needMoney;
									}								
									postUser.monthLeft = monthLeft;


									logger.debug(`contractLeft: ${contractLeft}`);



									function getVipLeft(weekContract){
										//let weekContract = 24.75;  //99/4;
										if(contractLeft >= weekContract*3){
											postUser.vipTimeLeft = 4;
											
										}else if(contractLeft >= weekContract*2 ){
											postUser.vipTimeLeft = 3;
										}else if(contractLeft >= weekContract*1 ){
											postUser.vipTimeLeft = 2;
										}else if(contractLeft >= 0 ){
											postUser.vipTimeLeft = 0;
										}else{
											postUser.vipTimeLeft = 0;
										}
										logger.debug(`postUser.vipTimeLeft ${postUser.vipTimeLeft}`); 
									}

									
									logger.debug(`latestRole is: ${latestRole}`);//latestRole is modified like Junior Admin

									if(latestRole == 'Trial'){ 
										getVipLeft(24.75);//99/4;
										logger.debug(`enter into trial if`);
									}else if(latestRole == 'Yearly'){
										logger.debug(`enter into yearly if`);
										getVipLeft(18.375);
									}else if(latestRole === 'Super Admin' || latestRole === 'Junior Admin' ){
										postUser.vipTimeLeft = 'Infinite';
									}
									logger.debug(`postUser.vipTimeLeft ${postUser.vipTimeLeft}`);      


									res.render("users/profile", {
										user: req.user ? req.user.processUser(req.user) : req.user,
										isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
										isProfile: isProfile,
										postUser: postUser,
										posts: posts,

										pageNumber: Math.ceil(count/10),
										page: page,
										isFirstPage: (page - 1) === 0,
										isLastPage: ((page - 1) * 10 + posts.length) == count, 

										title: postUser.username + '的个人页面',
										keywords: '用户页面',
										description: postUser.username+'的个人页面',                                                       
										messages: {
											error: req.flash('error'),
											success: req.flash('success'),
											info: req.flash('info'),
										}, // get the user out of session and pass to template
									});                                
							});						
					});
                    //postProxy.getPostsByUserId(req,res,user_id,'users/profile');
		},

		updateUser: (req,res)=>{
		        	res.render('form/userUpdate', {
		 	            user : req.user ? req.user.processUser(req.user) : req.user,
			            messages: {

							title:seo.user.update.title,
							keywords:seo.user.update.keywords,
							description:seo.user.update.description,	
			            	error: req.flash('error'),
			            	success: req.flash('success'),
			            	info: req.flash('info'),
			            }, // get the user out of session and pass to template	            
		        	});
		},

		forgotPassword: (req, res)=> {
				  res.render('form/resetPw', {
				    user: req.user ? req.user.processUser(req.user) : req.user,

					title:seo.user.forgotPw.title,
					keywords:seo.user.forgotPw.keywords,
					description:seo.user.forgotPw.description,						
		            messages: {
		            	error: req.flash('error'),
		            	success: req.flash('success'),
		            	info: req.flash('info'),
		            }, 	    
				  });
		},

		getResetToken: (req, res)=> {
						User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, (err, user)=> {
								    if (!user) {
								      req.flash('error', 'Password reset token is invalid or has expired.');
								      res.redirect('/user/forgotPassword');
								    }
								    res.render('form/resetPwFields', {
										    user: req.user ? req.user.processUser(req.user) : req.user,
											title:seo.user.resetPW.title,
											keywords:seo.user.resetPW.keywords,
											description:seo.user.resetPW.description,												
								            messages: {
								            	error: req.flash('error'),
								            	success: req.flash('success'),
								            	info: req.flash('info'),
								            },	    
								    });
				        });
		},

		postResetToken: (req,res)=> {//we do not specify specific action route for the /reset/:token page, so it will use the /reset/:token as its action route
			  						
			      const promis = new Promise(function(resolve,reject){
						// console.log('working fine up the update function');
						User.findOne({'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() }}, function(err,user){
							if(!user){
								reject(`Password reset token is invalid or has expired`);
							}else{
								resolve(user);
							}
					   });
				  });

				  promis.then(function(user){

						const password = req.body.password;
						if(password.length < 5){
								req.flash('error', 'Password field must be more than 5 characters!');

								res.redirect('response/err/404');
						}
						const newPassword = user.generateHash(password);
						// user.local.resetPasswordToken = undefined;
						// user.local.resetPasswordExpires = undefined;
						//user.local.password = newPassword;
						const conditions = { 'local.active': true, 'local.email':req.body.email },
						
						update = {'local.password':  newPassword,
								'local.resetPasswordToken': undefined,
								'local.resetPasswordExpires': undefined},
						////$push: {sku: req.body.sku},
						options = {upsert: true};


		               ////use user will not work
		               User.update(
		               	  conditions,update,options,
		               	  (err,raw)=>{
		               	  	//logger.debug('no error in the above of if err');
		               	  	if(err){
		               	  		logger.error(err.stack,raw);
		               	  		req.flash('error', 'There was a error processing your request!');
		               	  		res.redirect(303,'/user/reset/'+ req.params.token);
		               	  	}
							req.logIn(user, err=>{

								mailService.send(user.local.email,'Your password has been changed!', 
									'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
								);
							});

		                    req.flash('success', 'successfully Updated your password!');
		                    res.redirect(303, '/user/profile');
		               	  }
		             );					  
				  }).
				  catch(function(err){
						logger.error('error', err);
						flash('error',err);
						res.redirect('back');
				  });

		             

		               // or we can use the following is ok too 
		               //user.save(function(err){
		               // 	  if(err){console.log(err);}
		               // 	  req.logIn(user,function(err){
		               // 	  	  mailService.send(user.local.email,'Your password has been changed!', 
		               //            'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
		               // 	  	  	);
		               // 	  });

		               // });
		               // req.flash('success', 'Success! Your password has been changed.');
		               // res.redirect('/user/profile');
		       	 
		},

		postForgotPassword: (req,res)=>{
		       
					//var token;
					//console.log();
					crypto.randomBytes(20, (err, buf) => {
					  if (err) {console.log(err);}

					  
		              if(buf){
		              	       logger.debug(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
		              	       const token = buf.toString('hex'),
								     email = validator.trim(xss(req.body.email));


					 			console.log(email);
					            User.findOne({ 'local.email': email }, function(err, user) {
					                        if(err){
												logger.error(err);
												req.flash('error','Error when getting email!');
												res.redirect('back');
											}
											logger.debug(`user by email is : ${user}` );
									        // if (!user) {
									        //   req.flash('error', 'Email Token!');
									        //   return res.redirect('/user/forgotPassword');
									        // }
											if(!!user){
												let expires = Date.now() + 3600000;
												logger.debug('entering into findOne in postForgotPassword func. user: '+ JSON.stringify(user));

												user.local.resetPasswordToken = token;

												user.local.resetPasswordExpires = expires; // 1 hour
												//user.local.password = user.generateHash(req.body.password);
											// console.log(Date.now().getDate(),Date.now().getTime());

												mailService.send(user.local.email, 'Password Reset', 
															'<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
															'Please click on the following link, or paste this into your browser to complete the process(the password reset will be invalid in 1 hour ):</p>\n\n' +
															'<strong> http://' + req.headers.host + '/user/reset/' + token + '</strong>\n\n' +
															'<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>\n'

													);
												user.save(err=> {
													if (err){logger.error(`err in saving user: ${err}`);}
													req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.!');
													res.redirect('/user/login');
													//return done(null, user, );

												});
											}else{
											  req.flash('error', 'No user found by the Email!');
									          return res.redirect('/user/forgotPassword');
											}

			


					             });   

		              }

					});

		},

		putUpdateUser: User=>{
		       return function(req,res){
		            let   locals    = req.user.local, 
					      username = locals.username,
					      email    = locals.email;
							User.findOne({ 'local.email': email }, (err, user)=> {
										if(err){logger.error(err);return;}
										if (!user) {
											req.flash('error', '用户邮箱不存在，请重新登录!');
											res.redirect('/user/login');
										}else{
											   const username = validator.trim(xxs(req.body.username)),
											         email = validator.trim(xxs(req.body.email));
												user.local.username = username;
												user.local.email = email;
												mailService.send(user.local.email, 'User Upadate', 
																'<p>You have successfully update your information!</p>'+
																'Your new username:'+ username +'/n'+
																'Your new email:' + email
												);
												user.save(err=> {
													if (err){logger.error(`error saving user: ${err}`);}
													req.flash('success', '更新成功!');
													res.redirect('/user/profile');
													//return done(null, user, );

												});											
										}



								}); 
				    
					
		        };
		},


		logout: (req,res)=>{
					//req.logout();
					req.session.destroy(err=>{
						  if(err) {
						    logger.error(err);
						  } else {
						    res.redirect('/');
						  }				
					});
					//YOU CAN ALSO USE REQ.LOGOUT() IF YOU DO NOT USE REDIS
					//Passport exposes a logout() function on req (also aliased as logOut()) that can be called from any route handler which needs to terminate a login session. Invoking logout() will remove the req.user property and clear the login session (if any).
					// res.redirect('/');
		},



		 /*******we can use one of the following for /postSignup=*******/
		 /*************/
		    // app.post('/postSignup', passport.authenticate('local-signup', {
		    //     failureRedirect : '/signup', // redirect back to the signup page if there is an error
		    //     failureFlash : true // allow flash messages
		    // }), function(req, res) {

		 //       res.render('email/signupMessage',
		 //       	   {layout:null, user:req.user}, function(err,html){
		 //       	   	   if(err){console.log('err in email template', err);}
		 //       	   	   try{
		 //       	   	   	  mailService.send(req.user.local.email,'Thanks for your signup!',html);
		 //       	   	   }catch(ex){
		 //       	   	   	  mailService.mailError('the email widget broke down!', __filename,ex);
		 //       	   	   }
		               
		 //       	   }

		 //       	);
		 //       res.render('response/success',{user: req.user});


		 //    });
		postSignup: passport=>{

		     return function(req, res, next) {
				  passport.authenticate('local-signup', (err, user, info)=> {
				    if (err) { return next(err); }else{
								if (!user) {
									//req.flash('error', 'No such user exists'); 
									return res.redirect('/user/signup'); 
								}else{
										req.logIn(user, err=> {
												if (err) { return next(err); }
												res.render('email/signupMessage',
														{layout:null, user:user}, (err,html)=>{
															if(err){logger.error('err in email template', err);}
															try{
																mailService.send(user.local.email,'感谢注册!',html);
															}catch(ex){
																mailService.mailError('the email widget broke down!', __filename,ex);
															}
															
														}

												);
												req.flash('success','注册成功!');
												return res.redirect('/user/profile/'+ user._id);

										});
								}

					}

					

				  })(req, res, next);
		     };
 
        },

		postLogin: function(passport){
		    return function(req,res,next){
		        	passport.authenticate('local-login', (err, user, info)=>{
						    if (err) { return next(err); }
						    if (!user) { 
						    	req.flash('error','邮箱或密码错误!')
						    	return res.redirect('/user/login'); 
						    }
						    req.logIn(user, function(err) {
						    	if (err) { return next(err); }
						    	
						    	req.flash('success','登录成功!')
						    	return res.redirect('/');
		 
						    });        		
				    })(req, res, next);
		    };
		 },


		postFileUpload: (req,res)=>{


                const uploadFiles = require('../common/file')(req,res,undefined,'logo_exist');
                logger.debug('uploadFiles is :'+JSON.stringify(uploadFiles));
                uploadFiles.getData(function(err,fields,file,photoName){
                  if(err){
                        logger.debug('error when uploadFile: '+err);
                        redirect.back('/');;
                  }else{
						if(req.user){
							function saveFileInfo(){
								
								const user = req.user;
								user.local.logo = photoName;
								user.save(err=>{
									if(err){throw err}
									req.flash('success','上传头像成功');
									res.redirect('/user/profile/'+ user._id);
								});

							}
							saveFileInfo();
							// req.flash('success', 'Uploading successfully!');
							// return res.xhr ? res.json({success: true}) :
							// res.redirect(303, '/success');
						//  saveFileInfo('upload-photo', fields.email,req.params.year,fields.params.year,fields.params.month,path);
						}else{
							logger.info('user not login');
							req.flash('eror','You need to login first to upload your logo');
							res.redirect(303, '/user/login');
						}						  
				  }

			 });


		},




};//end of exports
