"use strict";
const Post = require('../models/Post'),
	User = require('../models/User'),
      postProxy = require('../db_proxy/post'),
      userProxy = require('../db_proxy/user'),
      logger = require('../lib/logger'),
      seo = require('../config/seo');

module.exports = {


        //  home(req,res){
        //         const page = req.query.p ? parseInt(req.query.p,10) : 1;
        //         let loginedUser;

        //         //查询并返回第 page 页的 10 篇文章
        //         postProxy.getTen(null, page, (err, posts, count)=> {
        //             if (err) {
        //                 console.log('some error with getting the 10 posts:'+ err);
        //                 //next(err);
        //                 posts = [];
        //             } 
        //             console.log(posts);
                    
        //             res.render('home/home', {
        //                     user: req.user ? req.user.processUser(req.user) : req.user,
        //                     //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
        //                     posts: posts,
        //                     page: page,
        //                     isFirstPage: (page - 1) == 0,
        //                     isLastPage: ((page - 1) * 10 + posts.length) == count,

        //                     title:seo.home.title,
        //                     keywords:seo.group.keywords,
        //                     description:seo.group.description,  
        //                     messages: {
        //                         error: req.flash('error'),
        //                         success: req.flash('success'),
        //                         info: req.flash('info'),
        //                     }, // get the user out of session and pass to template
        //             }); 


        //         });	 
                

        // },

        service(req,res){
              const options = {
                  title:seo.about.service.title,
                  keywords:seo.about.service.keywords,
                  description:seo.about.service.description,  
                  messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                  }, // get the user out of session and pass to template                    
              };
              res.render('home/service',options);
        },

        rules(req,res){
              const options = {
                  title:seo.about.rule.title,
                  keywords:seo.about.rule.keywords,
                  description:seo.about.rule.description,  
                  messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                  }, // get the user out of session and pass to template                    
              };
              res.render('home/rule',options);
        },





};

