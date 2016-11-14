"use strict";
const moment = require('moment'),
    Post = require('../models/Post'),
    User = require('../models/User'),
    Comment = require('../models/Comment'),
    Tag = require('../models/Tag'),
    postProxy = require('../db_proxy/post'),
    userProxy = require('../db_proxy/user'),
    tagProxy = require('../db_proxy/tag'),
    config = require('../config/config'),
    seo = require('../config/seo'),
    helper = require('../lib/utility'),
    bodyParser   = require('body-parser'),
    path = require('path'),
    logger = require('../lib/logger'),
    validator = require('validator'),
    xss = require('xss'),  
    fs = require('fs'),
    formidable = require('formidable'),
    im = require('gm').subClass({imageMagick: true});

const appDir = path.dirname(require.main.filename),
      uploadDir = path.join(appDir,'public/upload/');

module.exports =  {
     
      latestTopic: (req,res)=>{
            const page = req.query.p ? parseInt(req.query.p) : 1;
            const p = new Promise(function(resolve,reject){
                  postProxy.getTen(null, page, (err, posts, count)=> {
                  if (err) {
                        logger.error('some error with getting the 10 personal posts:'+ err);
                        posts = [];
                        reject(`Error getting posts: ${err}`);
                        return;
                  }
                  resolve(posts,count);                    
                  
                  },undefined,undefined,'exit_user_id');

            });

            p.then(function(posts,count){
                  let options = {
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        posts:  posts, 
                        page: page,
                        pageNumber: Math.ceil(count/10),
                        isFirstPage: (page - 1) == 0,
                        isLastPage: ((page - 1) * 10 + posts.length) == count,

                        title:seo.home.title,
                        keywords:seo.home.keywords,
                        description:seo.home.description,                                                 
                        messages: {
                              error: req.flash('error'),
                              success: req.flash('success'),
                              info: req.flash('info'),
                        },                                             
                  };

                  res.render('post/latestTopic',options);
            })
            .catch(function(err){
                  logger.error(err.message);
                  req.flash('error','无文章发表!');
                  res.redirect('back');
            });


            
      },
      postWithUpload:(req,res)=>{
                const uploadFiles = require('../common/file')(req,res,'post_exist');
                logger.debug('uploadFiles is :'+JSON.stringify(uploadFiles));
                uploadFiles.getData(function(err,fields,file,photoName){
                  if(err){
                        logger.debug('error when uploadFile: '+err);
                        redirect.back('/');;
                  }

                  logger.debug('get into the getData func');
                   if(req.user){
                        function saveFileInfo(){
                              const user = req.user.processUser(req.user),
                                    title = validator.trim(xss(fields.title)),
                                    content = validator.trim(xss(fields.content)),
                                    tags = validator.trim(xss(fields.tags)),
                                    category = fields.category,
                                    // intro = fields.intro,
                                    group_id = fields.group_id;

                              
                              const post = new Post();
                              post.author = user.username;
                              post.user_id = user._id;
                              post.title = title;
                              post.content = content;
                              //post.intro = intro;
                              post.group_id = group_id;

                              post.category = category;
                              post.image = photoName;

                              
            
                              post.save((err)=>{
                                    if(err){
                                          logger.error('post save error'+err);
                                          req.flash('error',`发布文章失败`);
                                          res.redirect('back');
                                    }else{
                                          tagProxy.saveSingle(req,res,post,tags);
                                          logger.debug(`your post saved successfully: ${post._id}`);
                                          req.flash('success','发布成功！');
                                          
                                          res.redirect(`/post/show/${post.title}`);
                                          //res.redirect('/');
                                    }
                              });                                            

                        }
                        saveFileInfo();
                  }else{
                        logger.info('user not login');
                        req.flash('error','请先登录！');
                        res.redirect(303, '/user/login');
                  }                     
                });

    },

      makeArticle: (req,res)=>{
            let fromGroup_id = req.query.group_id; 
            logger.debug(`ismobile is ${helper.isMobile(req)}`);
                       
            res.render('form/post', {
                  user: req.user.processUser(req.user),
                  isMobile: helper.isMobile(req),

                  title:seo.post.make.title,
                  keywords:seo.post.make.keywords,
                  description:seo.post.make.description,
                  messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                  },
                  fromGroup_id: fromGroup_id,                  

            });
      },


      // editPost: (req,res)=>{
      //       let fromGroup_id = req.query.group_id; 
      //       console.log(`ismobile is ${helper.isMobile(req)}`);
                       
      //       res.render('form/post', {
      //             user: req.user.processUser(req.user),
      //             isMobile: helper.isMobile(req),

      //             title:seo.post.make.title,
      //             keywords:seo.post.make.keywords,
      //             description:seo.post.make.description,
      //             messages: {
      //                   error: req.flash('error'),
      //                   success: req.flash('success'),
      //                   info: req.flash('info'),
      //             },
      //             fromGroup_id: fromGroup_id,                  

      //       });
      // },




      getPersonalPosts: (req,res)=>{
                  const user_id = req.params.user_id;   
                  postProxy.getPostsByUserId(req,res,user_id,function(posts,count){
                        userProxy.getUserById(user_id, theuser=>{ 
                              let postUser = req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser;
 							let loginedUser;
							if(req.user){
								loginedUser = req.user.processUser(req.user);
							}                                         
                                    res.render(path, {
                                          user: req.user ? req.user.processUser(req.user) : req.user,
                                          isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
                                          postUser: postUser,
                                          posts: posts,

                                          pageNumber: Math.ceil(count/10),
                                          page: page,
                                          isFirstPage: (page - 1) == 0,
                                          isLastPage: ((page - 1) * 10 + posts.length) == count, 

                                          title: postUser.username + '的' + seo.post.person.title,
                                          keywords: seo.post.person.keywords,
                                          description: postUser.username + '的' + seo.post.person.description,                                                       
                                          messages: {
                                                error: req.flash('error'),
                                                success: req.flash('success'),
                                                info: req.flash('info'),
                                          }, // get the user out of session and pass to template
                                    });                                
                        });                       
                  });                               
                  postProxy.getPostsByUserId(req,res,user_id,'post/personalPosts');
                                  
                 
      },

       showPost: (req,res)=>{
             const title = req.params.title;
             postProxy.getPostByTitle(title).then(function(post){

                    postProxy.modifyPost(post,function(myPost){
                            post.user(post.user_id,theuser=>{
                                        let loginedUser;
                                        if(req.user){
                                            loginedUser = req.user.processUser(req.user);
                                        }      
                                        logger.debug('post.comments',JSON.stringify(myPost.comments));
                                        //commentUserId = myPost.comments.user_id;
                                        //let commentUser = 
                                        
                                          res.render('post/showOne', {
                                                      user: req.user ? req.user.processUser(req.user) : req.user,
                                                      postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                                                      post: myPost,
                                                      
                                                      //user_created_at: user_created_at,

                                                      title: myPost.title,
                                                      keywords:myPost.title,
                                                      description:myPost.intro,

                                                      messages: {
                                                      error: req.flash('error'),
                                                      success: req.flash('success'),
                                                      info: req.flash('info'),
                                                      }, // get the user out of session and pass to template
                                          });
                                   


                            });

                    });
                    logger.debug("Done");
                })
               .catch(function(err){
                  logger.error(`error With title ${title}: ${err.message ? err.message : err.stack}`);
                  req.flash('error','No such post!');
                  res.redirect('back');
               });
       },

      //  getAllPosts: function(req,res){

      //  },

      getPostEdit: (req,res)=>{
           const post_id = req.params.post_id;

            Post.findOne({'_id': post_id}, function(err,post){

                  if(err){
                        logger.error('cannot find the post by post id'+err);
                        req.flash('error',`error in find post for ${post_id}`);
                        res.redirect('back');
                  }else{
                        postProxy.modifyPost(post, function(myPost){
                              //let tagObjArray = modifiedPost.tags;              
                              //logger.debug('tags'+JSON.stringify(myPost.tags));
                              res.render('form/editPost', {
                                    user: req.user ? req.user.processUser(req.user) : req.user,
                                    post: myPost,
                                    //tagString: modifiedPost.tags.join('/'),
                                    
                                    isMobile: helper.isMobile(req),

                                    title:seo.post.edit.title,
                                    keywords:seo.post.edit.keywords,
                                    description:seo.post.edit.description,
                                    messages: {
                                          error: req.flash('error'),
                                          success: req.flash('success'),
                                          info: req.flash('info'),
                                    },                  

                               });
                        });
                        //let tagString = [];

                  }
            });

      },

      editPost:(req,res)=>{


                const uploadFiles = require('../common/file')(req,res,'post_exist');
                logger.debug('uploadFiles is :'+JSON.stringify(uploadFiles));
                uploadFiles.getData(function(err,fields,file,photoName){

                        logger.debug('enter into getData');
                        if(err){
                              logger.error('error when uploadFile: '+err);
                              redirect.back('/');;
                        }

                        let title = validator.trim(xss(fields.title)),
                              //category = xss(fields.category),
                              //image = photoName,
                              content = validator.trim(xss(fields.content));
                        
                        if(!(title.length > 4)  || !(file.photo.name.length) || !(content.length>10)){
                              logger.info('input need to do like it required');
                              req.flash('error','提交不符合规则！');
                              return res.redirect(303, 'back');                                      
                        }     
                        logger.debug('entering into restore data');
            
                        if(req.user){

                              const options = {
                                    title: title,
                                    image: photoName,  
                                    content:content,
                                    
                              };
                              const  post_id = req.params.post_id;

                              //const tags = xss(fields.tags);

                              
                              Post.findOneAndUpdate({'_id': post_id}, {$set: options}, {new: true},function(err, post) {
                                          if(err){
                                                logger.error(err);
                                                req.flash('error',`更新失败`);
                                                res.redirect('back');
                                          }else{
                                                //tagProxy.saveSingle(req,res,post,tags);
                                                logger.debug(`your post saved successfully: ${post._id}`);
                                                req.flash('success','更新成功！');
                                                res.redirect(`/post/show/${post.title}`);
                                                //res.redirect('/');
                                          }
                             });

                        }else{
                              logger.info('user not login');
                              req.flash('error','请先登录！');
                              res.redirect(303, '/user/login');
                        }                                   


                });//uploadFile.getData


                  // let dataDir = config.uploadDir;
                  // logger.debug(dataDir);
                  // let photoDir = dataDir + 'postLogo/';
            
                  //       //store the data to the database
                  //       const form = new formidable.IncomingForm();
                  //       form.parse(req,(err,fields,file)=>{
                  //       if(err){
                  //             logger.error('form parse error:' + err);
                  //             req.flash('error','提交出错');
                  //             return res.redirect(500, '/response/err/500');
                  //       }else{
                  //             const photo = file.photo;
                              
                  //             //let personalDir = `${req.user._id}/`;
                  //             let thedir = photoDir;
                  //             //prevent uploading file with the same name

                  //             const photoName = Date.now() + validator.trim(xss(photo.name)); 
                              
                  //             const fullPath = thedir + photoName;
                  //             let title = validator.trim(xss(fields.title)),
                  //                   //category = xss(fields.category),
                  //                   //image = photoName,
                  //                   content = validator.trim(xss(fields.content));
                              
                  //             if(title.length > 4  && photo.name.length && content.length>10){

                  //                   helper.checkDir(thedir,()=>{
                  //                         fs.rename(photo.path, fullPath, err=>{
                  //                               if (err) {logger.error(err); return; }
                  //                               logger.debug('The file has been re-named to: ' + fullPath);
                  //                         });										
                  //                   });                 
                  //                   if(req.user){

                  //                         const options = {
                  //                               title: title,
                                                
                  //                               image: photoName,  
                  //                               content:content,
                                                
                  //                         };
                  //                         const  post_id = req.params.post_id;

                  //                         //const tags = xss(fields.tags);

                                          
                  //                         Post.findOneAndUpdate({'_id': post_id}, {$set: options}, {new: true},function(err, post) {
                  //                                     if(err){
                  //                                           logger.error(err);
                  //                                           req.flash('error',`更新失败`);
                  //                                           res.redirect('back');
                  //                                     }else{
                  //                                           //tagProxy.saveSingle(req,res,post,tags);
                  //                                           logger.debug(`your post saved successfully: ${post._id}`);
                  //                                           req.flash('success','更新成功！');
                  //                                           res.redirect(`/post/show/${post.title}`);
                  //                                           //res.redirect('/');
                  //                                     }
                  //                         });

                  //                   }else{
                  //                         logger.info('user not login');
                  //                         req.flash('error','请先登录！');
                  //                         res.redirect(303, '/user/login');
                  //                   }                                   

                  //             }else{//if &&
                  //                   logger.info('input need to do like it required');
                  //                   req.flash('error','提交不符合规则！');
                  //                   res.redirect(303, 'back');                                    

                  //             }

                              

                                                
                  //             }

                  //       });//end of form.parse


      
    },


     deletePost: (req,res)=>{
           const post_id = req.params.post_id;
            postProxy.getPostById(post_id).then(function(post){
                  if(post.image){
                        logger.debug('post image: ' + post.image);
                        fs.unlink(`${uploadDir}postLogo/${post.image}`, function() {	   //fs.unlink 删除用户上传的文件
                              logger.debug('file is removed before deleting it');
                        });  
                  }
                  Post.remove({ '_id': post._id}, (err)=>{
                        if(err){
                              logger.error(`there is an error when removing the post : ${err}`);
                              req.flash('error','删除文章错误！');
                              res.redirect('back');
                        }else{

                              logger.debug(`The post with id of ${req.params.post_id} deleted successfully `);
                              req.flash('success','文章已删除!');
                              res.redirect('back');
                        }
                  });
            })
            .catch(function(err){
                  logger.error(`error With deletepost with id ${post_id}: ${err.message ? err.message : err}`);
                  req.flash('error','error with deleting post!');
                  res.redirect('back');
            });           
     },

     comment: (req,res)=>{
           const content = validator.trim(xss(req.body.content)),
                 title = validator.trim(xss(req.body.title)),
                 user = req.user.processUser(req.user),
                 author = user.username,
                 user_id = user._id;
                 

           
          logger.debug(`title is : ${title}`);
          Post.findOne({'title':title}, (err,post)=>{
                 if(err){
                       logger.error(err);
                       req.flash('error',`文章页面不存在`);
                       res.redirect('back');                       
                 }else{
                        const post_id = post._id; 
                        
                        const comment = new Comment();
                        comment.content = content;
                        comment.author = author;
                        comment.user_id = user_id;
                        comment.post_id = post_id;

                        comment.save(err=>{
                              if(err){
                                    logger.error(`there is some errors when save the post ${err}`);
                                    req.flash('error',`存储错误`);
                                    res.redirect('back');                       
                              }else{
                                    logger.debug('comment saved successfully');
                                    req.flash('success','留言成功！');
                                    res.redirect('back');
                              }

                        });                       

                 }              
          });

            

     },

     getTagsPost: (req,res)=>{
                const tag_id = req.params.tag_id;
                const page = req.query.p ? parseInt(req.query.p) : 1;
                //let loginedUser;
                logger.debug('entering into the tagpost');

                //查询并返回第 page 页的 10 篇文章
                postProxy.getTen(tag_id, page, (err, posts, count)=> {
                    if (err) {
                    logger.error('some error with getting the 10 posts:'+ err);
                    //next(err);
                    posts = [];
                    } 
                    // if(req.user){
                    //     loginedUser = req.user.processUser(req.user);
                    // }
                    //userProxy.getUserById(user_id, theuser=>{
                    logger.debug('tag posts for'+ tag_id +posts);
                    
                    res.render('post/tagPosts', {
                           
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                            posts: posts,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * 10 + posts.length) == count,

                              title:tag_id +'的'+seo.post.tagPosts.title,
                              keywords:seo.post.tagPosts.keywords,
                              description:seo.post.tagPosts.description,                            
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template
                    }); 


                },'exist_tag_id');	           

     },

     getSearch: function(req,res){
            const page = req.query.p ? parseInt(req.query.p) : 1;
            //let loginedUser;
            logger.debug('entering into the serarchPost');           
            let keyword;
            if(req.query.keyword){
                keyword = req.query.keyword;
            }
           
           pattern = new RegExp(keyword, "i");
           logger.debug('keyword search for'+ keyword);
           postProxy.getTen(pattern, page, (err, posts, count)=> {
                    if (err) {
                        logger.error('some error with getting the 10 posts for search page:'+ err);
                        posts = [];
                    } 
                    res.render('post/tagPosts', {
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                            posts: posts,
                            keyword: keyword,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * 10 + posts.length) == count,

                            title:seo.post.search.title,
                            keywords:seo.post.search.keywords,
                            description:seo.post.search.description,
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template
                    });                 
           },undefined,'exits_title',undefined);

     },






};