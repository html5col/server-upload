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

        modifyPost: function(post,cb){
             let modifiedPost = post.processPost(post);
             let modifiedComments;

            let getComments = new Promise(function(resolve,reject){
                 post.comments(post._id,function(comments){ 
                     resolve(comments);
                 });   
             });
             let getGroup = new Promise(function(resolve,reject){
                 post.group(post.group_id,function(group){
                     resolve(group);
                 });
             });

             Promise.all([getComments,getGroup]).then(function(values){
                for(let i=0;i<values.length;i++){
                    modifiedPost.comments = values[0];
                    modifiedPost.group = values[1];
                }
                //logger.debug('modifiedPost in modifyPost function'+modifiedPost);
                cb(modifiedPost);
             });

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
                  req.flash('error','No such user!');
                  res.redirect('back');
               });
            
  
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
                    //console.log(`query[${name}] is`+ Object.keys(query));
                }
                
                const getCount = new Promise(function(resolve,reject){
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
                getCount.then(function(count){
                    Post.find(query).skip((page-1)*5).limit(5).sort({'updated_at':-1}).exec((err,posts)=>{
                            if (err) {
                               logger.error(`no posts found: ${err}`);
                               //throw.error('no post found');
                               res.redirect('/response/error/404');
                            }
                            //console.log('Posts inthe getTen function is: '+posts);
                            
                                // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
                               // let modifiedPosts = globalThis.modifyPosts(posts);
                               let myPosts = [];
                               posts.forEach(function(post){
                                  globalThis.modifyPost(post,function(apost){
                                      myPosts.push(apost);
                                      if(myPosts.length == posts.length){
                                        callback(null, myPosts, count);//provide the params(caluated values),and what to do? you need to figure it out yourself
                                      }

                                  });
                               });
                                    
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


        /**
         * get post by id.return a promise
         * @param {String} id 
         */        
        getPostById: function(id){
            if(!id){
                req.flash('error','No id exsit！');
                res.redirect('back');
            }else{
               const findPost =  new Promise(function(resolve,reject){
                       Post.findById(id,function(err,post){
                                if (err) {
                                    logger.error(`something wrong when getPostById:${err}`);
                                    reject(err);
                                    return
                                } else {
                                    //setting view times
                                    resolve(post.processPost(post));
                              }                            
                        });
              }); //findPost
              return findPost;
           }//else  
        },

        /**
         * get post by title.return a promise
         * @param {String} title 
         */
        getPostByTitle: function(title){
            if(!title){
                req.flash('error','No title exsit！');
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
                                        resolve(post);   
                                    });   
                              }                            
                        });
              }); //findPost

              return findPost;
          }//else   
      },


};                       
                   
