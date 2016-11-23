"use strict";
const User    = require('../models/User'),
      Post = require('../models/Post'),
      Comment = require('../models/Comment'),
      userProxy = require('../db_proxy/user'),
      moment = require('moment'),
      helper = require('../lib/utility'),
      validator = require('validator'),
      xss = require('xss'),     
      config = require('../config/config'), 
      //co_handle = require('../lib/co-handler'),
      logger = require('../lib/logger');                           

module.exports = {
        modifyPosts: function(posts,fn){
            // 异步并发

            // function myLogicFun(arr,allDoneCallback){
            //     var i, newArr=[],totalItemLength=arr.length;
                
            //     function watcher(resultData){
            //         newArr.push(resultData);
            //         if(newArr.length===totalItemLength){
            //             //all done
            //             allDoneCallback(newArr);
            //         }
            //     }
                
            //     for(i=0;i< totalItemLength;i++){
            //         （function(item){
            //             //do your business
            //             watcher(resultData);
            //         }(arr[i]));
            //     }
            
            // }

            // var arr=[....];
            // myLogicFun(arr,function(resultDaas){
            //     console.log(resultDaas)
            // });
            // 或者异步顺序

            // function myLogicFun(arr,allDoneCallback){
            //     var arrtmp=arr.slice(0);
            //     var newArr=[];
            //     function doNext(){
            //         var someItem= arrtmp.shift();
            //         if(someItem){
            //             doAsync(function(resultData){
            //                 newArr.push(resultData);
            //                 doNext();
            //             });
            //         }else{
            //             //all done
            //             allDoneCallback(newArr);
            //         }
            //     }
                
            //     doNext();
                
            // }

            // var arr=[....];
            // myLogicFun(arr,function(resultDaas){
            //     console.log(resultDaas)
            // });

            // 这是你请求数据的方法，注意我是用steTimeout模拟的
            let that = this;
            function fetchData(post) {
                return new Promise(function(resolve,reject) {
                    //posts.forEach(function(post){
                        that.modifyPost(post,function(newPost){
                            resolve(newPost);
                        });
                    //});
                });
            }

            // 用数组里面的元素做请求，去获取响应数据
            var promiseArr = posts.map(function(thepost) {
                    return fetchData(thepost);
            });

            Promise.all(promiseArr).then(function(respDataArr) {
                // 在这里使用最终的数据
                logger.debug(respDataArr);
                fn(respDataArr);
            }).catch(function(er){
                logger.error(`err when using promise in modifiedPosts func: ${er.message?er.message:er.stack}`);
                res.redirect('/response/error/404');
            });
        },

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
                logger.debug('modifiedPost in modifyPost function'+modifiedPost);
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
                   },undefined,undefined,'exit_user_id','undefined');

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
                const globalThis = this,
                      topicCount = config.list_topic_count;
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
                    Post.find(query).skip((page-1)*topicCount).limit(topicCount).sort({'updated_at':-1}).exec((err,posts)=>{
                            if (err) {
                               logger.error(`no posts found: ${err}`);
                               //throw.error('no post found');
                               res.redirect('/response/error/404');
                            }
                            //console.log('Posts inthe getTen function is: '+posts);
                            
                                // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
                               // let modifiedPosts = globalThis.modifyPosts(posts);

                            globalThis.modifyPosts(posts,function(newPosts){
                                 callback(null, newPosts, count);   
                            });
                           
                            // for(let i=0,length=posts.length;i<length;i++){
                                

                            //     let modifiedPost = posts[i].processPost(posts[i]);
                            //     posts[i].comments(posts[i]._id,function(comments){
                            //         modifiedPost.comments = comments;

                            //         posts[i].group(posts[i].group_id,function(group){
                            //             modifiedPost.group = group;
                                        
                            //         });

                            //     });

                            // }

                           // callback(null,posts,count);
                             

                            // callback(null, modifiedPosts, count);   
                               
                            // .catch(function(err){
                            //     logger.debug('err when using modifyPosts in getTen func '+err);
                            //     res.redirect('back');
                            // }); 
                            //console.log('modifiedPosts: '+modifiedPosts);  


                            //    let myPosts = [];
                               
                            //    posts.forEach(function(post){

                                  
                            //       let modifyPost = new Promise(function(resolve,reject){
                            //           globalThis.modifyPost(post,function(apost){
                            //               resolve(apost);
                            //           });
                            //       });
                            //       modifyPost.then(function(apost){
                            //           myPosts.push(apost);

                                     
                            //       }).catch(function(e){
                            //           logger.error('error'+ e);
                            //       });

                            //    });
                            //    if(myPosts.length === posts.length){
                            //        callback(null, myPosts, count);

                            //    }
                               
                                    
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
                                    return;
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
                   
