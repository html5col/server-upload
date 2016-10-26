"use strict";
const User    = require('../models/User'),
      Post = require('../models/Post'),
      Comment = require('../models/Comment'),
      userProxy = require('../db_proxy/user'),
      moment = require('moment'),
      helper = require('../lib/utility'),
      validator = require('validator'),
      xss = require('xss'),      
      logger = require('../lib/logger');                           

module.exports = {

        modifyPosts: function(posts){
            let modifiedPosts = posts.map(post=>{
                    let modifiedPost = post.processPost(post)
                    post.comments(post._id,function(comments){
                        modifiedPost.comments = comments;
                    });
                    post.group(post.group_id,function(group){
                        modifiedPost.group = group;
                    });
                    return modifiedPost;
            }); 
            return modifiedPosts;           
        },
        modifyPost: function(post){
            let modifiedPost = post.processPost(post);
            let modifiedComments;

            post.comments(post._id,function(comments){                         
                        ////add user object to post.comments
                    //console.log('comments...'+JSON.stringify(comments));
                    modifiedComments = comments.map(function(v){
                        let modifiedComment = v;
                        User.findOne({'_id':v.user_id}).exec().then(function(user){
                            modifiedComment.user = user.processUser(user);
                            logger.debug('userbyid\'s commnet first'+JSON.stringify( modifiedComment));
                            return modifiedComment;
                        });
                        logger.debug('modifiedComment first'+JSON.stringify( modifiedComment));
                        return modifiedComment;
                    });
                    

                    logger.debug('modifiedComments...'+JSON.stringify(modifiedComments));

                    //add post.comments              
                    modifiedPost.comments = modifiedComments;
                    logger.debug('modifiedPost in modifiedPost util func'+JSON.stringify(modifiedPost));
                   
            });
            logger.debug('console.log(modifiedComments);'+modifiedComments);
            
            
            post.group(post.group_id,function(group){
                modifiedPost.group = group;
                
            });  
            return modifiedPost;
    

            
        },            
        /**
         * 根据用户名列表查找用户列表
         * Callback:
         * - err, 数据库异常
         * - users, 用户列表
         * @param {Array} names 用户名列表
         * @param {Function} callback 回调函数
         */
        // exports.getPostsByUserId = function (user_id, callback) {
        //   if (user_id.length === 0) {
        //     return callback(null, []);
        //   }
        //   Post.find({ 'user_id': user_id }, callback);
        // };       
        /**
         * 根据用户名列表查找用户列表
         * Callback:
         * - 
         * - users, 用户列表
         * @param {Array} names 用户名列表
         * @param {Function} callback 回调函数
         */
        getPostsByUserId:  function(req,res,user_id,fn){
            //const user_created_at = moment(req.user.local.created_at).format('MMMM Do YYYY, h:mm:ss a'),

                //判断是否是第一页，并把请求的页数转换成 number 类型
               const page = req.query.p ? parseInt(req.query.p) : 1,
                     outThis = this;

               const p = new Promise(function(resolve,reject){
                    //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
                    outThis.getTen(user_id, page, (err, posts, count)=> {
                        if (err) {
                            logger.error('some error with getting the 10 personal posts:'+ err);
                            //next(err);
                            reject(`Error getting posts: ${err}`);
                            posts = [];
                        }else{
                           // console.log('getPostsByUserId\'s getTen: '+ user_id +posts);
                            resolve(posts,count);                           

                        }
                   },undefined,undefined,'exit_user_id');

               });
               p.then(function(posts,count){
                  fn(posts,count);
               })
               .catch(function(err){
                   //err.message is for error object
                   //Promise chaining allows you to catch errors that may occur in a fulfillment or rejection handler from a previous promise. For example:
                  logger.debug(err.message ? err.message : err);
                  req.flash('error','没找到用户!');
                  res.redirect('back');
               });
            
  
        },


        getPostByTitle:  function(req,res,title,path){
            const globalThis = this;

            if(!title){
                req.flash('error','文章标题不存在！');
                res.redirect('back');
            }else{

               let findPost =  new Promise(function(resolve,reject){
                       let conditions = { 'title': title };
                        Post.findOne(conditions,function(err,post){
                                if (err) {
                                    reject(err);
                                    return
                                } else {
                                    //setting view times
                                    let update = { $inc: { 'pv': 1 }};//increment
                                    Post.findOneAndUpdate(conditions, update, function(err,post){
                                        if(err){
                                            logger.error(`there is error when update the pv: ${err}`);
                                            reject(err);
                                        }
                                    });   
                                    resolve(post);                                 
                            
                              }                            
                        });
                });
                findPost.then(function(post){
                    let newPost = globalThis.modifyPost(post);
                    post.user(post.user_id,theuser=>{
                                let loginedUser;
                                if(req.user){
                                    loginedUser = req.user.processUser(req.user);
                                }      
                                //newPost.comments
                                // for(let c of newPost.comments){
                                //     console.log(c.user);
                                // }
                              logger.debug('post.comments',JSON.stringify(newPost.comments));
                

                                res.render(path, {
                                        user: req.user ? req.user.processUser(req.user) : req.user,
                                        postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                                        post: newPost,
                                        //user_created_at: user_created_at,

                                        title: newPost.title,
                                        keywords:newPost.title,
                                        description:newPost.intro,

                                        messages: {
                                            error: req.flash('error'),
                                            success: req.flash('success'),
                                            info: req.flash('info'),
                                        }, // get the user out of session and pass to template
                                });

                    });
                    logger.debug("Done");
                })
               .catch(function(err){
                  logger.error(`error With title ${title}: ${err.message ? err.message : err}`);
                  req.flash('error','读取文章出错!');
                  res.redirect('back');
               });


        }//end of else
            
   },

        /**
         * get 10 posts per page
         * Callback:
         * - err, error
         * - posts, posts per page
         * @param {variable} name 
         * @param {Number} page :fetch from the url ..?p=..
         * @param {Function} callback
         */
        
        getTen:  function(name,page,callback, ...args){

                let query = {};
                const globalThis = this;
                if(name){
                    if(args[0]){         
                        query.tag_id = name;
                    }else if(args[1]){
                        query.title = name;
                    }else if(args[2]){
                        query.user_id = name;
                    }else if(args[3]){
                        query.group_id = name;
                    }
                    console.log(`query[${name}] is`+ Object.keys(query));
                }
                
                const promis = new Promise(function(resolve,reject){
                    //使用 count 返回特定查询的文档数 total    
                    Post.count(query, ( err, count)=>{
                        //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
                        if (err) {
                                //return callback(err);
                                reject(err);
                                return;
                        }
                        logger.debug( `Number of posts: ${count} . query is ${query}` );
                        resolve(count);
                    });  
                });
                promis.then(function(count){
                    Post.find(query).skip((page-1)*10).limit(10).sort({'updated_at':-1}).exec((err,posts)=>{
                            if (err) {
                               logger.error(`no posts found: ${err}`);
                               //throw.error('no post found');
                               res.redirect('/response/error/404');
                            }
                            //console.log('Posts inthe getTen function is: '+posts);
                            const modifiedPosts = globalThis.modifyPosts(posts); 

                            logger.debug('modifiedPosts: '+modifiedPosts);
                            callback(null, modifiedPosts, count);//provide the params(caluated values),and what to do? you need to figure it out yourself

                                    
                    });
                })
                .catch(function(err){
                    return callback(err.message ? err.message : err);
                });
                // Post.find(query,{
                //     skip: (page-10)*10,
                //     limit:10,
                //     sort:{
                //        'created_at':-1
                //     },
                // },function。。);  

        },

        // getPostsByTagId: fuction(tag_id,callback){
        //     Post.find({'tag_id': tag_id},function(err,posts){

                
        //     });
        // },




};                       
                   
