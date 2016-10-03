"use strict";

const url = require('url'),
      Post = require('../models/Post'),
	  User = require('../models/User'),
      Group = require('../models/Group'),
      groupProxy = require('../db_proxy/group'),
      userProxy = require('../db_proxy/user'),
      postProxy = require('../db_proxy/post'),
      config = require('../config/config'),
      fs = require('fs'),
	  utils = require('../lib/utility'),
      bodyParser   = require('body-parser'),
      formidable = require('formidable');

module.exports = {

         home(req,res){
            //console.log(mailService.sendToGroup(['frank25184@icloud.com','ddd@dd.com','djfd@sdf.com'],'subject','this is body'));
            
            //判断是否是第一页，并把请求的页数转换成 number 类型
                //const page = req.query.p ? parseInt(req.query.p,10) : 1;
                let loginedUser;

                //查询并返回第 page 页的 10 篇文章
                // groupProxy.getTen(null, page, (err, posts, count)=> {
                //     if (err) {
                //     console.log('some error with getting the 10 posts:'+ err);
                //     //next(err);
                //     posts = [];
                //     } 
                     
                     if(req.user){
                         loginedUser = req.user.processUser(req.user);
                     }
                    userProxy.getUserById(user_id, theuser=>{
                        console.log(posts);
                    });	
                    res.render('group/group', {
                            title: 'group page',
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                            //posts: posts,
                            //page: page,
                            //isFirstPage: (page - 1) == 0,
                            //isLastPage: ((page - 1) * 10 + posts.length) == count,
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template
                    }); 


                

        },

        groups(req,res){
                    let getGroups = new Promise(function(resolve,reject){
                        Group.find({},function(err,groups){
                            if(err){reject(err)}else if(groups){
                                     resolve(groups);
                            }
                        });
                    });
                    getGroups.then(function(groups){
                        groups = groups.map(function(v){
                            return v.processGroup(v);
                        })
                        res.render('group/groups',{

                            //pageTestScript: '/js/page-test/tests-about.js',//know which test file to be used in this route
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            },		        
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            groups: groups,
                        });
                    });


        },
        // group(req,res){
        //             let group_id = req.params.group_id;
                    
    
        //                 let user = req.user?req.user.processUser(req.user):req.user;
                         
        //                  console.log('first myGroups'+myGroups);
                     

        //             let getGroup = new Promise(function(resolve,reject){
        //                 Group.findOne({'_id':group_id},function(err,group){
        //                     if(err){
        //                         reject(err);
        //                     }else if(group){
                                
        //                         group = group.processGroup(group);
        //                         resolve(group);
        //                     }
        //                 });
        //             });
        //             getGroup.then(function(group){
        //                 let belongToGroup = false;

        //                 let myGroups = user? user.myGroups:false;
        //                 if(myGroups){
        //                     belongToGroup = myGroups.includes(group.title);
        //                     console.log(`belongToGroup : ${belongToGroup}`);
        //                 }
                        
        //                 res.render('group/group',{
        //                     //pageTestScript: '/js/page-test/tests-about.js',//know which test file to be used in this route
        //                     messages: {
        //                         error: req.flash('error'),
        //                         success: req.flash('success'),
        //                         info: req.flash('info'),
        //                     },		        
        //                     user: req.user ? req.user.processUser(req.user) : req.user,
        //                     group: group, 
        //                     belongToGroup: belongToGroup ? belongToGroup:false,
        //                 });
        //             })
        //            .catch(function(e){
        //                     console.log(`something wrong with getting the group page : ${e}`);
        //                     req.flash('error',`Error getting the single group page!`);
        //                     return res.redirect('back');
        //            }); 

        // },        
        newGroup(req,res){

            res.render('form/newGroup',{
                // pageTestScript: '/js/page-test/tests-about.js',//know which test file to be used in this route
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success'),
                    info: req.flash('info'),
                },		        
                user: req.user ? req.user.processUser(req.user) : req.user,
            });



        },
        newGroupUpload(app){
            return  function newGroupPost(req,res){

                    let dataDir;
		            if(app.get('env')=== 'development'){
		            	dataDir = config.uploadDir.development;
		            }else{
		            	dataDir = config.uploadDir.production;
		            }
                   // let dataDir = config.upload.path;

					console.log(dataDir);
					let photoDir = dataDir + 'groupLogo/';

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
                                            const group = new Group(),
                                                    user = req.user,
                                                    title = fields.title,
                                                    category = fields.category,
                                                    privateOnly = fields.private,
                                                    intro = fields.intro;
                                                    

                                            group.author = user.local.username;
                                            group.user_id = user._id;
                                            group.title = title;
                                            group.intro = intro;
                                            group.private = privateOnly;
                                            group.category = category;
                                            group.logo = photoName;
                                            
                                            
                                            group.save((err)=>{
                                                    if(err){
                                                        console.log(err);
                                                        req.flash('error',`出现错误： ${err}`);
                                                        res.redirect('back');
                                                    }else{
                                                        
                                                        console.log(`创建小组成功: ${group._id}`);
                                                        req.flash('success','创建小组成功，等待审核!');
                                                        res.redirect('/group/single/'+ group._id);
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

				        });


				    } catch(ex){
				        return res.xhr ?
				            res.json({error: 'Database error.'}):
				            res.redirect(303, '/response/error/500');
				    }
                 


           };
        },
        singleGroup(req,res){
           let group_id = req.params.group_id;
          // console.log('ground_id in singleGroup FUNCTION '+group_id);
           const page = req.query.p ? parseInt(req.query.p) : 1;
           
            let getGroup = new Promise(function(resolve,reject){
                let findOption = {'_id': group_id};
                Group.findOne(findOption,function(err,group){
                    if(err){
                        console.log(`page not found: no group wih group_id : ${group_id}`);
                        reject(err);
                        //res.redirect('/response/error/404');
                    }else{
                        resolve(group);
                    }
                });
            });


            getGroup.then(function(group){
               let belongToGroup = false;
    
                let user = req.user?req.user.processUser(req.user):req.user;
                console.log('user'+user);    

               let myGroups = user ? user.myGroups:false;
                if(myGroups){
                    belongToGroup = myGroups.includes(group.title);
                    console.log(`belongToGroup : ${belongToGroup}`);
                }
                postProxy.getTen(group_id, page, (err, posts, count)=>{
                        const option = {
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            groupOwner: req.user ? (req.user._id == group.user_id ? true : false) : false,
                            group: group,
                            belongToGroup: belongToGroup ? belongToGroup:false,
                            posts: posts,

                            page: page,
                            pageNumber: Math.ceil(count/10),
                            isFirstPage: (page - 1) == 0,
                            isLastPage: ((page - 1) * 10 + posts.length) == count,  

                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template                    
                        };  
                        res.render('group/group',option);

                },undefined,undefined,undefined,'exit_group_id');

            


            }).
            catch(function(e){
                    console.log(`something wrong with getting the group page : ${e}`);
                    req.flash('error',`Error getting the single group page!`);
                    return res.redirect('back');
            });
        },

        applyGroup(req,res){
            var query = url.parse(req.url, true).query;
            let group_id = query.group_id;
              let user = req.user;

            console.log(`the group_id in applyGroup function ${group_id}`);


            let getGroup = new Promise(function(resolve,reject){
                let findOption = {'_id': group_id};
                Group.findOne(findOption,function(err,group){
                    if(err){
                        console.log(`page not found: no group wih group_id : ${id}`);
                        reject(err);
                        //res.redirect('/response/error/404');
                    }else{
                        resolve(group);
                    }
                });
            });



            getGroup.then(function(group){
                console.log(group.title);
                user.local.myGroups.push(group.title);
                user.save(function(err){
                    if(err){
                        console.log(`something wrong with storing the groupvalue to user.myGroups : ${e}`);
                        req.flash('error',`Error with the server.We are fixing it right now!`);
                        return res.redirect('/response/err/404');
                    }else{
                        console.log('successfully store the group value');
                    }
                    
                });              
                // const option = {
                //     user: req.user ? req.user.processUser(req.user) : req.user,
                //     groupOwner: req.user ? (req.user._id == group.user_id ? true : false) : false,
                //     group: group,
                //     messages: {
                //         error: req.flash('error'),
                //         success: req.flash('success'),
                //         info: req.flash('info'),
                //     }, // get the user out of session and pass to template                    
                // };
                res.redirect('/group/single/'+ group._id); 
            }).catch(function(e){
                console.log(`something wrong with the getGroup function : ${e}`);
                req.flash('error',`Error finding the single group!`);
                return res.redirect('/response/err/404');
            });        
            
          

        },







};
