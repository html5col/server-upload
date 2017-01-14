"use strict";
const Post = require('../models/Post'),
	User = require('../models/User'),
      postProxy = require('../db_proxy/post'),
      userProxy = require('../db_proxy/user'),
      logger = require('../lib/logger'),
      seo = require('../config/seo');

module.exports = {

        example(req,res){
					    res.setHeader('Access-Control-Allow-Origin', 'http://home.news.cn');
              const options = {
                  //layout: 'desktop',
                  title:seo.media.example.title,
                  keywords:seo.media.example.keywords,
                  description:seo.media.example.description,  
                  messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                  }, // get the user out of session and pass to template                    
              };
              res.render('media/example',options);
        },





};

