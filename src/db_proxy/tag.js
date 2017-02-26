"use strict";
const User    = require('../models/User'),
      Post = require('../models/Post'),
      Tag = require('../models/Tag'),
      Comment = require('../models/Comment'),
      userProxy = require('../db_proxy/user'),
      logger = require('../lib/logger'),
      moment = require('moment');
//var utility = require('utility');                              


module.exports = {
        saveSingle: (req,res,post,tags)=>{
                
                let tagsArray = tags.split('/');

                //let tagString = tag.name;
                tagsArray.forEach((v,i,a)=>{
                    //let count;
                    let tag = new Tag();
                    tag.name = v;
                    tag.user_id = req.user.processUser(req.user)._id;
                    tag.post_id = post._id;

                    Tag.findOne({'name':v },function(err,tag){
                        if(tag){
                           tag.count += 1;
                        }                      
                    });

                    tag.save(err=>{
                        if(err){
                            logger.error('something wrong with storaging tag:'+ err);
                            req.flash('error','something wrong with storaging tag');
                            return;
                        }else{

                            Post.findById(post._id, (err,post)=>{

                                Post.findOneAndUpdate({'_id': post._id}, {$push: { 'tag_id': tag._id}}, {new: true},(err, post)=> {
                                    if(err){
                                            logger.error(err);
                                            next(err);
                                    }else{
                                            //res.redirect('/post/show/'+ post.title);
                                            logger.debug('findOneAndUpdate for tags array \'s post is'+post);
                                            return;
                                    }
                                }); 
                                
                            });                            
                            logger.debug('tag saved successfully');
                            //return;
                        
                        }
                    });

                });

        },
};
