"use strict";
const Post = require('../models/Post'),
	User = require('../models/User'),
    Expat = require('../models/Expat'),
    Book = require('../models/Book'),
    postProxy = require('../db_proxy/post'),
    userProxy = require('../db_proxy/user'),
    config = require('../common/get-config'),
    helper = require('../lib/utility'),
    co = require('co'),
    validator = require('validator'),
    xss = require('xss'), 
    fs = require('fs'),
    formidable = require('formidable'),
    bodyParser   = require('body-parser'),
    im = require('gm').subClass({imageMagick: true}),
      logger = require('../lib/logger'),
      seo = require('../config/seo');

module.exports = {

         classfiedCode(req,res){
            res.render('desktop/classfiedCode', {
                    layout: 'desktop',
                    //isMobile: isMobile,
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.classfiedCode.title,
                    keywords:seo.desktop.classfiedCode.keywords,
                    description:seo.desktop.classfiedCode.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            });             
         },
         classfiedCoded(req,res){
            let code = req.body.code;
            if(code==='trverdotcom'){
                if(!req.user){
                    logger.debug(`You need to log in first!`);
                    return res.redirect('/courses/login');
                }else{
                    res.render('desktop/expats/tobetutor', {
                            layout: 'desktop',
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            title:seo.desktop.courses.betutor.title,
                            keywords:seo.desktop.courses.betutor.keywords,
                            description:seo.desktop.courses.betutor.description,  
                            messages: {
                                error: req.flash('error'),
                                success: req.flash('success'),
                                info: req.flash('info'),
                            }, // get the user out of session and pass to template
                    }); 
                }
            }else if(code === 'courses'){
                res.redirect('/courses');
            }
            else{
                res.redirect('back');
            }
            
         },         
         home(req,res){
            let isMobile = helper.isMobile(req);
            res.render('desktop/home', {
                    layout: 'desktop',
                    isMobile: isMobile,
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.home.title,
                    keywords:seo.desktop.home.keywords,
                    description:seo.desktop.home.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            }); 

       },
       tutorProfile(req,res){
            let isMobile = helper.isMobile(req);
            let id = req.query.user_id;
            co(function*(){
                let expat = yield Expat.findOne({'user_id':id}).exec();
                let expatUser = yield User.findById(id).exec();
                res.render('desktop/expats/profile', {
                        layout: 'desktop',
                        expat: expat,
                        expatUser: expatUser,
                        isMobile: isMobile,
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        title:seo.desktop.tutorProfile.title,
                        keywords:seo.desktop.tutorProfile.keywords,
                        description:seo.desktop.tutorProfile.description,  
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        }, // get the user out of session and pass to template
                });
            });
            
 

       },   

       t2h(req,res){
            res.render('desktop/courses/t2hCourse', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.t2h.title,
                    keywords:seo.desktop.courses.t2h.keywords,
                    description:seo.desktop.courses.t2h.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            }); 

       },
       t2a(req,res){
            res.render('desktop/courses/t2aCourse', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.t2a.title,
                    keywords:seo.desktop.courses.t2a.keywords,
                    description:seo.desktop.courses.t2a.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            }); 

       },
       speakdaily(req,res){
            res.render('desktop/courses/speakdaily', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.speakdaily.title,
                    keywords:seo.desktop.courses.speakdaily.keywords,
                    description:seo.desktop.courses.speakdaily.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            }); 

    },

      questions(req,res){
            res.render('desktop/about/questions', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.questions.title,
                    keywords:seo.desktop.courses.questions.keywords,
                    description:seo.desktop.courses.questions.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            }); 

    },
    signup(req,res){
             res.render('desktop/user/register', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.signup.title,
                    keywords:seo.desktop.courses.signup.keywords,
                    description:seo.desktop.courses.signup.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            });            
    },

    login(req,res){
             res.render('desktop/user/login', {
                    layout: 'desktop',
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    title:seo.desktop.courses.login.title,
                    keywords:seo.desktop.courses.login.keywords,
                    description:seo.desktop.courses.login.description,  
                    messages: {
                        error: req.flash('error'),
                        success: req.flash('success'),
                        info: req.flash('info'),
                    }, // get the user out of session and pass to template
            });            
    },
    book(req,res){


            if(!req.user){
                logger.debug(`You need to log in first!`);
                return res.redirect('/courses/login');
            }else{
                res.render('desktop/form/book', {
                        layout: 'desktop',
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        title:seo.desktop.courses.book.title,
                        keywords:seo.desktop.courses.book.keywords,
                        description:seo.desktop.courses.book.description,  
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        }, // get the user out of session and pass to template
                }); 
            }
            
    },
    bookUpload(req,res){
               let dataDir = config.uploadDir;
                logger.debug(dataDir);

                let photoDir;
                    photoDir = dataDir + 'book/';
                                helper.checkDir(dataDir);
                helper.checkDir(photoDir);	
                const form = new formidable.IncomingForm(); 

                    logger.debug('into the getData Func');
                    form.parse(req,(err,fields,files)=>{
                        logger.debug('into the formparse cb. files'+JSON.stringify(files)+ `fields ${fields}`);

                         // let names = [];

                          let processImg = function(photo){

                                const size = photo.size,
                                        path = photo.path;
                                logger.debug(`file in formiable: ${JSON.stringify(files)}`);
                                if(validator.isEmpty(photo.name)){
                                        logger.error('the photo uploaded in groupUpload is emtpy or the photo name not existing');
                                        req.flash('error','The image uploaded is empty!');
                                        return res.redirect('back');
                                    }
                                    //1TB = 1024GB = 1024*1024MB = 1024*1024*1024KB = 1024*1024*1024*1024Byte = 1024*1024*1024*8 bit
                                    if(size > 5*1024*1024){//1mb
                                        fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                            logger.debug('file is more than 2 mb and be deleted.Please upload smaller one');
                                            req.flash('error',"file more than 2MB");
                                            res.redirect('back');
                                        });                                   
                                    }else if(photo.type.split('/')[0] != 'image'){
                                        logger.debug('file is not a valid image file');
                                        res.redirect('back');                                 
                                    }
                                    
                                    let thedir = photoDir;
                                    //prevent uploading file with the same name                                   
                                    const photoName = Date.now() + validator.trim(xss(photo.name)); 
                                    if(photo === files.familyPic){
                                        files.familyPic.name = photoName;
                                    }else if(photo === files.identity){
                                        files.identity.name = photoName;
                                    }else if(photo === files.houseOwnerVerify){
                                        files.houseOwnerVerify.name = photoName;
                                    }

                                    const fullPath = thedir + photoName;
                    // const visa = Date.now() + validator.trim(xss(files.visa.name)),
                    //       studentCertificate = Date.now() + validator.trim(xss(files.studentCertificate.name)),
                    //       drivePermit = Date.now() + validator.trim(xss(files.drivePermit.name)); 

                                    function dealWithImg(w,h){
                                        im(path)
                                        .resize(w,h,'!')
                                        .autoOrient()
                                        .write(fullPath,function(err){
                                            if (err) {
                                                    logger.error('imageMagic write error: '+ err); 
                                                    //callback(err); 
                                                    throw new Error('imageMAGIC ERROR');
                                            }
                                            logger.debug('The file has been re-named to: ' + fullPath);
                                            fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                                logger.debug('file is removed after renaming it');
                                            }); 
                                        });                                          
                                    }

                                    dealWithImg(500,500);
                          }


                          processImg(files.familyPic);
                          processImg(files.identity);
                          processImg(files.houseOwnerVerify);

                          let user = req.user.processUser(req.user);
                        

                        let book = new Book();
                                book.user_id = user._id;
                                book.name = fields.name;
                                book.livingLocation = fields.livingLocation;
                                book.phone = fields.phone;
                                
                                book.targetLanguage = fields.targetLanguage;
                                book.intro = fields.intro;

                                book.identity = files.identity.name;
                                book.familyPic = files.familyPic.name;
                                book.houseOwnerVerify = files.houseOwnerVerify.name;
                                
                                logger.debug(JSON.stringify(book));

    
                                book.save(function(err,book){
                                        if(err){
                                            logger.error(`error when saving book form : ${err.stack?err.stack:err.message}`);
                                            
                                        }else{
                                            req.flash('success','Thanks for your interest. We\'ll contack you asap!');
                                            res.redirect('/');
                                        }
                                });
                                      
                    });//form.parse                


    }, 

    applyForTutor(req,res){


            if(!req.user){
                logger.debug(`You need to log in first!`);
                return res.redirect('/courses/login');
            }else{
                res.render('desktop/expats/tobetutor', {
                        layout: 'desktop',
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        title:seo.desktop.courses.betutor.title,
                        keywords:seo.desktop.courses.betutor.keywords,
                        description:seo.desktop.courses.betutor.description,  
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        }, // get the user out of session and pass to template
                }); 
            }
            
    }, 
    tutorUpload(req,res){

                let dataDir = config.uploadDir;
                logger.debug(dataDir);

                let photoDir;
                    photoDir = dataDir + 'certificate/';
                                helper.checkDir(dataDir);
                helper.checkDir(photoDir);	
                const form = new formidable.IncomingForm(); 

                    logger.debug('into the getData Func');
                    form.parse(req,(err,fields,files)=>{
                        if(err){
                            console.log(`err when form.parse: ${JSON.stringify(err)}`);
                            return res.redirect('back');
                        }
                        logger.debug('into the formparse cb. files'+JSON.stringify(files)+ `fields ${fields}`);

                         // let names = [];

                          let processImg = function(photo){

                                const size = photo.size,
                                        path = photo.path;
                                logger.debug(`file in formiable: ${JSON.stringify(files)}`);
                                if(validator.isEmpty(photo.name)){
                                        logger.error('the photo uploaded in expatUpload is emtpy or the photo name not existing');
                                        req.flash('error','The image uploaded is empty!');
                                        return res.redirect('back');
                                }
                                    //1TB = 1024GB = 1024*1024MB = 1024*1024*1024KB = 1024*1024*1024*1024Byte = 1024*1024*1024*8 bit
                                    if(size > 5*1024*1024){//1mb
                                        fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                            logger.debug('file is more than 5 mb and be deleted.Please upload smaller one');
                                            req.flash('error',"file more than 5MB");
                                            return res.redirect('back');
                                        });                                   
                                    }else if(photo.type.split('/')[0] != 'image'){
                                        logger.debug('file is not a valid image file');
                                        req.flash('error',"file not valid");
                                        res.redirect('back');                                 
                                    }
                                    
                                    let thedir = photoDir;
                                    //prevent uploading file with the same name                                   
                                    const photoName = Date.now() + validator.trim(xss(photo.name)); 
                                    if(photo === files.visa){
                                        files.visa.name = photoName;
                                    }else if(photo === files.studentsCertificate){
                                        files.studentsCertificate.name = photoName;
                                    }else if(photo === files.personal){
                                        files.personal.name = photoName;   
                                    }
  
                                    // if(files.drivePermit){
                                    //     if(photo === files.drivePermit){
                                    //         files.drivePermit.name = photoName;
                                    //     }  
                                    // }                               

                                    const fullPath = thedir + photoName;
                    // const visa = Date.now() + validator.trim(xss(files.visa.name)),
                    //       studentCertificate = Date.now() + validator.trim(xss(files.studentCertificate.name)),
                    //       drivePermit = Date.now() + validator.trim(xss(files.drivePermit.name)); 

                                    function dealWithImg(w,h){
                                        im(path)
                                        .resize(w,h,'!')
                                        .autoOrient()
                                        .write(fullPath,function(err){
                                            if (err) {
                                                    logger.error('imageMagic write error: '+ err); 
                                                    //callback(err); 
                                                    throw new Error('imageMAGIC ERROR');
                                            }
                                            logger.debug('The file has been re-named to: ' + fullPath);
                                            fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                                logger.debug('file is removed after renaming it');
                                            }); 
                                        });                                          
                                    }

                                    dealWithImg(500,500);
                          }


                          processImg(files.visa);
                          processImg(files.studentsCertificate);
                        //   if(files.drivePermit){
                        //       processImg(files.drivePermit);

                        //   }
                          
                          processImg(files.personal);
                          console.log(`file.personal: ${JSON.stringify(files.personal)}`);


                        //   for(let i=0,length=files.personal.lenth;i<length;i++){
                        //       processImg(files.personal[i]);
                        //   }
                        
                        let user = req.user.processUser(req.user);
                        let expat = new Expat();
                                expat.user_id = user._id;
                                expat.name = fields.name;
                                expat.college = fields.college;
                                expat.country = fields.country;
                                expat.phone = fields.phone;
                                
                                expat.experience = fields.experience;
                                expat.choiceCountry = fields.choiceCountry;
                                expat.choiceState = fields.choiceState;
                                expat.choiceDetail = fields.choiceDetail;
                                expat.fromCountry = fields.fromCountry;
                                expat.fromState = fields.fromState;
                                expat.status = fields.status;
                                expat.nativeLanguage = fields.nativeLanguage;
                                expat.secondLanguage = fields.secondLanguage;
                                 expat.drivePermit = fields.drivePermit;
                                
                                expat.visa = files.visa.name;
                                expat.studentsCertificate = files.studentsCertificate.name;
                                // if(files.drivePermit){
                                //     expat.drivePermit = files.drivePermit.name;
                                // }
                                expat.personal = files.personal.name;
                                //logger.debug(expat.visa,expat.studentsCertificate,expat.drivePermit,expat.personal);
                                logger.debug(`fields is: ${JSON.stringify(fields)} EXPATS is ${JSON.stringify(expat)}`);



       


                                expat.save(function(err,auser){
                                        if(err){
                                            logger.error(`error when saving expat form : ${err.stack?err.stack:err.message}`);
                                            //throw new Error(`error when saving data`);
                                             return res.redirect('back');
                                            
                                        }else{
                                            req.flash('success','Thanks for your interest. We\'ll contack you asap!');
                                            res.redirect(`/courses/profile?user_id=${auser.user_id}`);
                                        }
                                });
                                      
                    });//form.parse                


    }, 

    tutors(req, res){

            //  Expat.find({}, function(err,expats){
            //     let allExpats = expats.map(function(expat){
            //         let expat_id = expat._id;
            //         let user = User.findById(expat_id,function(err,user){
            //             user = user.processUser(user);
                          
            //         });
                    

            //     });
            //  });
             

            // res.render('desktop/expats/expatsList', {
            //         layout: 'desktop',
            //         user: req.user ? req.user.processUser(req.user) : req.user,
            //         title:seo.desktop.courses.expatsList.title,
            //         keywords:seo.desktop.courses.expatsList.keywords,
            //         description:seo.desktop.courses.expatsList.description,  
            //         expats: allExpats,
            //         messages: {
            //             error: req.flash('error'),
            //             success: req.flash('success'),
            //             info: req.flash('info'),
            //         }, // get the user out of session and pass to template
            // }); 


       
    },


};

