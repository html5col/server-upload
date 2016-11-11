"use strict";

const url = require('url'),
      Post = require('../models/Post'),
	  User = require('../models/User'),
      Group = require('../models/Group'),
      groupProxy = require('../db_proxy/group'),
      userProxy = require('../db_proxy/user'),
      postProxy = require('../db_proxy/post'),
      config = require('../config/config'),
      seo = require('../config/seo'),
      fs = require('fs'),
	  helper = require('../lib/utility'),
      bodyParser   = require('body-parser'),
      formidable = require('formidable'),
      logger = require('../lib/logger'),
      validator = require('validator'),
      xss = require('xss');

module.exports = {



        groups(req,res){
                    let getGroups = new Promise(function(resolve,reject){
                        Group.find({},function(err,groups){
                            if(err){
                                reject(err);
                                return;
                            }else if(groups){
                                resolve(groups);
                            }
                        });
                    });
                    getGroups.then(function(groups){
                        let thegroups = groups.map(function(v){
                            return v.processGroup(v);
                        });
                        let modifiedGroup,modifiedUser;
                        if(req.user){
                            modifiedUser = req.user.processUser(req.user);
                        }
                        res.render('group/groups',{

                            //pageTestScript: '/js/page-test/tests-about.js',//know which test file to be used in this route
                            title:seo.group.groups.title,
                            keywords:seo.group.groups.keywords,
                            description:seo.group.groups.description,

                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            },	
                            vip: modifiedUser ? modifiedUser.vip : false,
                            	        
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            groups: thegroups,
                        });
                    });


        },

        newGroup(req,res){
          
          if(req.user){
              let user = req.user.processUser(req.user);
              if(user.vip){
                    res.render('form/newGroup',{
                        // pageTestScript: '/js/page-test/tests-about.js',//know which test file to be used in this route
                        title:seo.group.new.title,
                        keywords:seo.group.new.keywords,
                        description:seo.group.new.description,  
                        isMobile: helper.isMobile(req),             
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        },		        
                        user: req.user ? req.user.processUser(req.user) : req.user,
                    });
              }else{
                  req.flash('error','Only VIP can create groups!');
                  res.render('/services');
              }
          }




        },

        newGroupUpload(req,res){

                let uploadFiles = require('../common/file')(req,res,undefined,undefined,'group_exist');
                logger.debug('uploadFiles is :'+JSON.stringify(uploadFiles));
                let getData = new Promise(function(resolve,reject){
                    uploadFiles.getData(function(err,...arg){//fields,files,photoName
                        if(err){
                            reject(err);
                            logger.debug('error in getData: '+err);
                            return;
                        }
                        resolve(arg);
                    });
                });
                getData.then(function(arg){
                     logger.debug('enter into getData');   
                     let fields = arg[0],
                         files = arg[1],
                         photoName = arg[2];
                     logger.debug(`fields ${JSON.stringify(fields)} files ${JSON.stringify(files)} photoName ${JSON.stringify(photoName)}`);
                    if(req.user){
                            const group = new Group(),
                                    user = req.user.processUser(req.user),
                                    title = validator.trim(xss(fields.title)),
                                    category = fields.category,
                                    //privateOnly = fields.private,
                                    intro = validator.trim(xss(fields.intro));
                                    
                            if(!(title.length > 4)  || !(files.photo.name.length) || !(intro.length>10)){
                                    logger.info('input need to do like it required');
                                    req.flash('error','Fill it as required!');
                                    return res.redirect(303, 'back');                                      
                            }    

                            group.author = user.username;
                            group.user_id = user._id;
                            group.title = title;
                            group.intro = intro;
                            //group.private = privateOnly;
                            group.category = category;
                            group.logo = photoName;
                            
                            
                            
                            group.save(err=>{
                                    if(err){
                                        logger.error(err);
                                        req.flash('error',`Please try agian`);
                                        res.redirect('back');
                                    }else{
                                        logger.debug('enter into save');
                                        logger.debug('group: '+ JSON.stringify(group));

                                        logger.debug(`创建小组成功: ${group._id}`);
                                        req.flash('success','创建小组成功，等待审核!');
                                        res.redirect(`/group/single/${group._id}`);
                                    }
                           });                                            

                    }else{
                        logger.info('user not login');
                        req.flash('error','Log In first！');
                        res.redirect(303, '/user/login');
                    }                   
                })
                .catch(function(err){
                    logger.error('something wrong with the upload getData func: '+ err.stack);
                    req.flash('error','wrong when uploading');
                    res.redirect('back');
                });
                    // let dataDir = config.uploadDir;
					// logger.debug(dataDir);
					// let photoDir = dataDir + 'groupLogo/';

                    // helper.checkDir(dataDir);
					// helper.checkDir(photoDir);		
				    // try{
				    //     //store the data to the database
				    //     const form = new formidable.IncomingForm();
				    //     form.parse(req,(err,fields,file)=>{
				    //         if(err){
					// 				req.flash('error','form parse error:' + err);
					// 				return res.redirect(500, '/response/err/500');
					// 		}else{
					// 				const photo = file.photo;
									
					// 				//let personalDir = `${req.user._id}/`;
					// 				let thedir = photoDir;
					// 				//prevent uploading file with the same name
                    //                 if(validator.isEmpty(file.photo.name)){
                    //                     logger.error('the photo uploaded in groupUpload is emtpy or the photo name not existing');
                    //                     req.flash('error','The image uploaded is empty!');
                    //                     return res.redirect('back');
                    //                 }

					// 				const photoName = Date.now() + validator.trim(xss(photo.name)); 
									
					// 				const fullPath = thedir + photoName;

					// 				//checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
					// 				helper.checkDir(thedir,()=>{
					// 					fs.rename(photo.path, fullPath, err=>{
					// 						if (err) {logger.error(err); return; }
					// 						logger.debug('The file has been re-named to: ' + fullPath);
					// 					});										
					// 				});

					// 				logger.debug('the dir is :' + thedir);
					// 				logger.debug(photo.name,photo.path,fullPath);
                                    
					// 				//rename or move the file uploaded;and photo.path is the temp file Formidable give
													
					// 				if(req.user){
					// 					function saveFileInfo(){
                                            
                    //                         const group = new Group(),
                    //                                 user = req.user,
                    //                                 title = validator.trim(xss(fields.title)),
                    //                                 category = fields.category,
                    //                                 //privateOnly = fields.private,
                    //                                 intro = validator.trim(xss(fields.intro));
                                                    
                    //                         if(validator.isEmpty(title) && validator.isEmpty(intro)){
                    //                             logger.error('Field(s) empty!');
                    //                             req.flash('error','Field(s) empty!');
                    //                             return res.redirect('back');                                            
                    //                         }
                    //                         group.author = user.local.username;
                    //                         group.user_id = user._id;
                    //                         group.title = title;
                    //                         group.intro = intro;
                    //                         //group.private = privateOnly;
                    //                         group.category = category;
                    //                         group.logo = photoName;
                                            
                                            
                    //                         group.save((err)=>{
                    //                                 if(err){
                    //                                     logger.error(err);
                    //                                     req.flash('error',`Please try agian`);
                    //                                     res.redirect('back');
                    //                                 }else{
                                                        
                    //                                     logger.debug(`创建小组成功: ${group._id}`);
                    //                                     req.flash('success','创建小组成功，等待审核!');
                    //                                     res.redirect('/group/single/'+ group._id);
                    //                                 }
                    //                         });                                            

					// 					}
					// 					saveFileInfo();
                    //                 }else{
					// 					logger.info('user not login');
					// 					req.flash('error','Log In first！');
					// 					res.redirect(303, '/user/login');
					// 				}								
					// 		}

				    //     });


				    // } catch(ex){
				    //     return res.xhr ?
				    //         res.json({error: 'Database error.'}):
				    //         res.redirect(303, '/response/error/500');
				    // }                

        },
        singleGroup(req,res){

           let group_id = req.params.group_id;
           logger.debug('ground_id in singleGroup FUNCTION '+ group_id);
           
           let page = 0;
           if(req.query){
               page = req.query.p ? parseInt(req.query.p) : 1;
           }

           groupProxy.getGroupById(group_id).then(function(group){

               let belongToGroup = false;   
               let modifiedUser;
               if(req.user){
                   modifiedUser =  req.user.processUser(req.user);
               }
               
               let auser = req.user ? modifiedUser : req.user;
               logger.debug('user'+JSON.stringify(auser));    
               let myGroups = auser ? auser.myGroups:false;
                if(myGroups){
                    belongToGroup = myGroups.includes(group.title);
                    logger.debug(`belongToGroup : ${belongToGroup}`);
                }
                postProxy.getTen(group_id, page, (err, posts, count)=>{
                        const option = {
                            user: auser,
                            groupOwner: req.user ? (req.user._id == group.user_id ? true : false) : false,
                            group: group,
                            belongToGroup: belongToGroup ? belongToGroup:false,
                            posts: posts,

                            page: page,
                            pageNumber: Math.ceil(count/10),
                            isFirstPage: (page - 1) === 0,
                            isLastPage: ((page - 1) * 10 + posts.length) === count,  

                            title:group.title,
                            keywords:group.title,
                            description:group.intro,  
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template                    
                        };  
                        res.render('group/group',option);

                },undefined,undefined,undefined,'exit_group_id');
           })
           .catch(function(e){
                    logger.error(`something wrong with getting the group page : ${e}`);
                    req.flash('error',`Cannot get the page! ${e}`);
                    res.redirect('back');
            });
        },

        applyGroup(req,res){
            var query = url.parse(req.url, true).query;
            let group_id = query.group_id;
              let user = req.user;

            logger.debug(`the group_id in applyGroup function ${group_id}`);

            let getGroup = new Promise(function(resolve,reject){
                let findOption = {'_id': group_id};
                Group.findOne(findOption,function(err,group){
                    if(err){
                        logger.error(`page not found: no group wih group_id : ${id}`);
                        reject(err);
                        return;
                        //res.redirect('/response/error/404');
                    }
                    resolve(group);
                    
                });
            });



            getGroup.then(function(group){
                logger.debug(group.title);
                user.local.myGroups.push(group.title);
                user.save(function(err){
                    if(err){
                        logger.error(`something wrong with storing the groupvalue to user.myGroups : ${e}`);
                        req.flash('error',`Error with the server.We are fixing it right now!`);
                        return res.redirect('/response/err/404');
                    }else{
                        logger.debug('successfully store the group value');
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
                logger.error(`something wrong with the getGroup function : ${e}`);
                req.flash('error',`Error finding the single group!`);
                return res.redirect('/response/err/404');
            });        
            
          

        },

        getGroupUpdate(req,res){
            const group_id = req.params.group_id;
            Group.findOne({'_id': group_id}, function(err,group){
                  if(err){
                        logger.error(err);
                        req.flash('error',`小组不存在！`);
                        res.redirect('back');
                  }else{
                        let modifiedGroup = group.processGroup(group);
                        res.render('form/groupUpdate', {
                              user: req.user ? req.user.processUser(req.user) : req.user,
                              group: modifiedGroup,
                              isMobile: helper.isMobile(req),
                              title: seo.group.edit.title,
                              keywords:seo.group.edit.keywords,
                              description:seo.group.edit.description,
                              messages: {
                                    error: req.flash('error'),
                                    success: req.flash('success'),
                                    info: req.flash('info'),
                              },                  

                        });
                  }
            });           
 
        },

        groupUpdate(req,res){
                  let dataDir = config.uploadDir;
                  logger.debug(dataDir);
                  let photoDir = dataDir + 'groupLogo/';
                  

		
                  try{

                    const form = new formidable.IncomingForm();
                    form.parse(req,(err,fields,file)=>{
                        if(err){
                              logger.error('form parse error:' + err);
                              req.flash('error','提交出错');
                              return res.redirect(500, '/response/err/500');
                        }else{
                              const photo = file.photo;
                              let thedir = photoDir;
                              const time = Date.now();

                              const photoName = time + validator.trim(xss(photo.name)); 
                              logger.debug('file.photo is' + JSON.stringify(photo));
                              
                              const fullPath = thedir + photoName;

                              helper.checkDir(thedir,()=>{
                                    fs.rename(photo.path, fullPath, err=>{
                                          if (err) {
                                              logger.error('rename error'+err); return; 
                                           }else{
                                               logger.debug('The file has been re-named to: ' + fullPath);
                                           }
                                          
                                    });										
                              });                 
                              if(req.user){
                                   let title = validator.trim(xss(fields.title)),
                                       category = fields.category,
                                       logo = photoName,
                                       intro = validator.trim(xss(fields.intro));


                                    if(title.length >= 2 && category && validator.trim(xss(photo.name)) && intro.length>=5){
                                        const options = {
                                            title: title,
                                            category: category,
                                            logo: logo,  
                                            intro:intro,
                                        };
                                        const group_id = req.params.group_id;
                                        Group.findById(group_id, function(err,group){
                                            if(err){
                                                req.flash('error','No such group！');
                                                res.redirect('back');
                                            }
                                            //fs.unlink(`/upload/groupLogo/${time}${group.logo}`,function(err){
                                                // if(err){
                                                //     console.log('unlink the groupLogo fails');
                                                // }else{
                                                   // console.log('unlink the groupLogo successfully');
                                                    Group.findOneAndUpdate({'_id': group_id}, {$set: options}, {new: true},function(err, group) {
                                                                
                                                                if(err){
                                                                    logger.error(err);
                                                                    req.flash('error',`更新小组失败`);
                                                                    res.redirect('back');
                                                                }else{
                                                                    //tagProxy.saveSingle(req,res,post,tags);
                                                                    logger.debug(`your group updated successfully: ${group._id}`);
                                                                    req.flash('success','Updating successfully！');
                                                                    res.redirect(`/group/single/${group._id}`);
                                                                    //res.redirect('/');
                                                                }
                                                    });                                                       

                                               // }
                                                
                                           // });
                                            

                                        });

                                        
                                     
                                    }else{
                                        req.flash('error','Please fill the right data！');
                                        res.redirect(303, 'back');                                        
                                    }


                              }else{
                                    logger.info('user not login');
                                    req.flash('error','Log in frist！');
                                    res.redirect(303, '/user/login');
                              }	

                        }


                    });//end of form.parse

                  } catch(ex){
                        logger.error(ex);
                        return res.xhr ?
                        res.json({error: 'error in database！'}):
                        res.redirect(303, '/response/error/500');
                  }            

        },







};

