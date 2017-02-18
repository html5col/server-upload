"use strict";
const logger = require('../lib/logger');
module.exports ={
		success: (req,res)=>{
				res.render('response/success',{

					title: '成功页面',
					keywords: '成功页面',
					description: '成功页面...',      
					messages: {
						error: req.flash('error'),
						success: req.flash('success'),
						info: req.flash('info'),
					}, 
					user: req.user ? req.user.processUser(req.user) : req.user,				
				});
		},

		//500 server error
		Error500: (req,res)=>{
				res.render('response/500',{
					title: '500失败页面',
					keywords: '500失败页面',
					description: '500失败页面...',   					
					messages: {
						error: req.flash('error'),
						success: req.flash('success'),
						info: req.flash('info'),
					}, 
					user: req.user ? req.user.processUser(req.user) : req.user,			
				});
		},

		//404 original page is not found
		Error404: (req,res)=>{
				res.render('response/404',{
					title: '页面没找到',
					keywords: '页面没找到',
					description: '页面没找到...',  

					messages: {
						error: req.flash('error'),
						success: req.flash('success'),
						info: req.flash('info'),
					}, 
					user: req.user ? req.user.processUser(req.user) : req.user,			
				});
		},

		
};


//exports...
