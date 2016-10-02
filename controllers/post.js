"use strict";
let moment = require('moment'),
    Post = require('../models/Post'),
    User = require('../models/User'),
    Comment = require('../models/Comment'),
    postProxy = require('../db_proxy/post'),
    tagProxy = require('../db_proxy/tag'),
    config = require('../config/config'),
    fs = require('fs'),
    utils = require('../lib/utility'),
    bodyParser   = require('body-parser'),
    formidable = require('formidable');
module.exports = {
      latestTopic: (req,res)=>{
            const page = req.query.p ? parseInt(req.query.p) : 1;

            const p = new Promise(function(resolve,reject){
                  postProxy.getTen(null, page, (err, posts, count)=> {
                  if (err) {
                        console.log('some error with getting the 10 personal posts:'+ err);
                        reject(`Error getting posts: ${err}`);
                        posts = [];
                  }else{
                        resolve(posts,count);                          
                  }
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
                        messages: {
                              error: req.flash('error'),
                              success: req.flash('success'),
                              info: req.flash('info'),
                        }, 
                                            
                  };
                  res.render('post/latestTopic',options);
            })
            .catch(function(err){
                  console.log(err.message);
                  req.flash('error','无文章发表!');
                  res.redirect('back');
            });


            
      },
      postWithUpload:(app)=>{
         return function postArticle(req,res){

                  // let dataDir;
                  // if(app.get('env')=== 'development'){
                  //       dataDir = config.uploadDir.development;
                  // }else{
                  //       dataDir = config.uploadDir.production;
                  // }
                  let dataDir = config.upload.path;

                  console.log(dataDir);
                  let photoDir = dataDir + 'postLogo/';

                  utils.checkDir(dataDir);
			utils.checkDir(photoDir);		
                  try{
                        //store the data to the database
                    const form = new formidable.IncomingForm();
                    form.parse(req,(err,fields,file)=>{
                        if(err){
                              req.flash('error','form parse error:' + err);
                              return res.redirect(500, '/response/err/500');
                        }else{
                              const photo = file.photo;
                              
                              //let personalDir = `${req.user._id}/`;
                              let thedir = photoDir;
                              //prevent uploading file with the same name

                              const photoName = req.user._id + photo.name; 
                              
                              const fullPath = thedir + photoName;

                              //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
                              utils.checkDir(thedir,()=>{
                                    fs.rename(photo.path, fullPath, err=>{
                                          if (err) {console.log(err); return; }
                                          console.log('The file has been re-named to: ' + fullPath);
                                    });										
                              });

                              console.log('the dir is :' + thedir);
                              console.log(photo.name,photo.path,fullPath);
            
                              //rename or move the file uploaded;and photo.path is the temp file Formidable give
                                                      
                              if(req.user){
                                    function saveFileInfo(){
                                          const user = req.user.processUser(req.user),
                                                title = fields.title,
                                                content = fields.content,
                                                tags = fields.tags,
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
                                                      console.log(err);
                                                      req.flash('error',`发布文章失败`);
                                                      res.redirect('back');
                                                }else{
                                                      tagProxy.saveSingle(req,res,post,tags);
                                                      console.log(`your post saved successfully: ${post._id}`);
                                                      req.flash('success','发布成功！');
                                                      res.redirect(`/post/show/${post.title}`);
                                                      //res.redirect('/');
                                                }
                                          });                                            

                                    }
                                    saveFileInfo();
                              }else{
                                    console.log('user not login');
                                    req.flash('error','请先登录！');
                                    res.redirect(303, '/user/login');
                              }								
                         }

                    });//end of form.parse

                  } catch(ex){
                        return res.xhr ?
                        res.json({error: '数据库错误！'}):
                        res.redirect(303, '/response/error/500');
                  }

      
      }; 
    },

      makeArticle: (req,res)=>{
            let fromGroup_id = req.query.group_id; 
            res.render('form/post', {
                  user: req.user.processUser(req.user),
                  messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                  },
                  fromGroup_id: fromGroup_id,                  

            });
      },

      getPersonalPosts: (req,res)=>{
                  const user_id = req.params.user_id;                                  
                  postProxy.getPostsByUserId(req,res,user_id,'post/personalPosts');
                                  
                 
       },

       showPost: (req,res)=>{
             const title = req.params.title;
             console.log('title is '+title);
             postProxy.getPostByTitle(req,res,title,'post/showOne');
       },

      //  getAllPosts: function(req,res){

      //  },

      getPostEdit: (req,res)=>{
           const post_id = req.params.post_id;
            Post.findOne({'_id': post_id}, function(err,post){
                  
                  if(err){
                        console.log(err);
                        req.flash('error',`error in find post for ${post_id}`);
                        res.redirect('back');
                  }else{
                        res.render('form/editPost', {
                              user: req.user ? req.user.processUser(req.user) : req.user,
                              post: postProxy.modifyPost(post),
                              messages: {
                                    error: req.flash('error'),
                                    success: req.flash('success'),
                                    info: req.flash('info'),
                              },                  

                        });
                  }

            });

      },


      editPost: (req,res)=>{

          const  post_id = req.params.post_id,
                 title = req.body.title,                
                 tags = req.body.tags,
                 category = req.body.category,
                 intro = req.body.intro,
                 content = req.body.content;


            const options = {
                  //author: user.local.username;
                  //user_id: user._id;
                  title: title,
                  content: content,
                  intro: intro,
                  //tags: req.body.tags,
                  //Post.tags = tags.split(',');
                  category: category,
            };
            
            //new: bool - if true, return the modified document rather than the original. defaults to false (changed in 4.0)
            //Finds a matching document, updates it according to the update arg, passing any options, and returns the found document (if any) to the callback. The query executes immediately if callback is passed else a Query object is returned.
            //Model.findOneAndUpdate([conditions], [update], [options], [callback])
            //http://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
            Post.findOneAndUpdate({'_id': post_id}, {$set: options}, {new: true},function(err, post) {
                  if(err){
                        console.log(err);
                        next(err);
                  }else{
                         
                         res.redirect('/post/show/'+ post.title);
 
                  }
            });            




     },

     deletePost: (req,res)=>{
           const post_id = req.params.post_id;
            Post.remove({ '_id': post_id }, (err)=>{
                  if(err){
                        req.flash('error',`there is an error when removing the post : ${err}`);
                        res.redirect('back');
                  }else{
                        console.log('User deleted!');
                        req.flash('success',`The post with id of ${req.params.post_id} deleted successfully `);
                        res.redirect('back');
                  }
            });


     },

     comment: (req,res)=>{
           const content = req.body.content,
                 title = req.body.title,
                 user = req.user.processUser(req.user),
                 author = user.username,
                 user_id = user._id;
         console.log(`title is : ${title}`);
          Post.findOne({'title':title}, (err,post)=>{
                 if(err){
                       console.log(err);
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
                                    console.log(err);
                                    req.flash('error',`there is some errors when save the post ${err}`);
                                    res.redirect('back');                       
                              }else{
                                    console.log('comment saved successfully');
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
                console.log('entering into the tagpost');

                //查询并返回第 page 页的 10 篇文章
                postProxy.getTen(tag_id, page, (err, posts, count)=> {
                    if (err) {
                    console.log('some error with getting the 10 posts:'+ err);
                    //next(err);
                    posts = [];
                    } 
                    // if(req.user){
                    //     loginedUser = req.user.processUser(req.user);
                    // }
                    //userProxy.getUserById(user_id, theuser=>{
                    console.log('tag posts for'+ tag_id +posts);
                    
                    res.render('post/tagPosts', {
                            title: 'specific tag page',
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                            posts: posts,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * 10 + posts.length) == count,
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
            console.log('entering into the serarchPost');           
            let keyword;
            if(req.query.keyword){
                keyword = req.query.keyword;
            }
           
           pattern = new RegExp(keyword, "i");
           console.log('keyword search for'+ keyword);
           postProxy.getTen(pattern, page, (err, posts, count)=> {
                    if (err) {
                        console.log('some error with getting the 10 posts for search page:'+ err);
                        posts = [];
                    } 
                    res.render('post/tagPosts', {
                            title: 'specific pages',
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                            posts: posts,
                            keyword: keyword,
                            page: page,
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * 10 + posts.length) == count,
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template
                    });                 
           },undefined,'exits_title',undefined);

     },






}