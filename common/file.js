"user strict"
      
const config = require('../config/config'),
      logger = require('../lib/logger'),
      helper = require('../lib/utility'),
      formidable = require('formidable'),
      fs = require('fs'),
      validator = require('validator'),
      im = require('gm').subClass({imageMagick: true}),
      xss = require('xss');     


module.exports = function(req,res,...arg){

                let file = {};

                let dataDir = config.uploadDir;
                logger.debug(dataDir);

                let photoDir;
                if(arg[0]){//post
                    photoDir = dataDir + 'postLogo/';
                }else if(arg[1]){
                    photoDir = dataDir + 'logo/';
                }else if(arg[2]){
                    photoDir = dataDir + 'groupLogo/';
                }

                helper.checkDir(dataDir);
                helper.checkDir(photoDir);	

            // try{
                //store the data to the database
                // formiable: {"photo":{"size":105397,"path":"/var/folders/vq/cdlwyckx68zdf586bd3c789h0000gn/T/upload_ab831f8c46383a1c8262ae71beac828c","name":"<script>leee<:script>.jpg","type":"image/jpeg","mtime":"2016-10-27T11:56:16.271Z"}}
                const form = new formidable.IncomingForm(); 
                //logger.debug('under formidable new');
                file.getData = function(callback){

                    logger.debug('into the getData Func');
                    form.parse(req,(err,fields,files)=>{
                        logger.debug('into the formparse cb ');


                        if(err){
                            logger.error('formidable form parse error'+err);
                            req.flash('error','Error when posting');
                            // return res.redirect('back');
                            callback(err);
                        }else{
                            
                            function processUpload(){

                                    const photo = files.photo,
                                            size = photo.size,
                                            path = photo.path;

                                    logger.debug(`file in formiable: ${JSON.stringify(files)}`);



                                   if(validator.isEmpty(photo.name)){
                                        logger.error('the photo uploaded in groupUpload is emtpy or the photo name not existing');
                                        req.flash('error','The image uploaded is empty!');
                                        return res.redirect('back');
                                    }
                                    //1TB = 1024GB = 1024*1024MB = 1024*1024*1024KB = 1024*1024*1024*1024Byte = 1024*1024*1024*8 bit
                                    if(size > 1*1024*1024){//1mb
                                        fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                            logger.debug('file is more than 1 mb and be deleted.Please upload smaller one');
                                            req.flash('error',"file not more than 1MB");
                                            res.redirect('back');
                                        });                                   
                                    }else if(photo.type.split('/')[0] != 'image'){
                                        logger.debug('file is not a valid image file');
                                        res.redirect('back');                                 
                                    }
                                    
                                    let thedir = photoDir;
                                    //prevent uploading file with the same name
                                    const photoName = Date.now() + validator.trim(xss(photo.name)); 
                                    
                                    const fullPath = thedir + photoName;

                                    //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
                                    if(arg[0]){//post
                                        im(path)
                                        .resize(300,250,'!')
                                        .autoOrient()
                                        .write(fullPath,function(err){
                                            if (err) {
                                                    logger.error('imageMagic write error: '+ err); 
                                                    return callback(err); 
                                            }
                                            logger.debug('The file has been re-named to: ' + fullPath);
                                            fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                                logger.debug('file is removed after renaming it');
                                            }); 
                                            callback(null,fields,files,photoName);  
                                            
                                        });  

                                    }else if(arg[1]){//userlogo
                                        im(path)
                                        .resize(60,60,'!')
                                        .autoOrient()
                                        .write(fullPath,function(err){
                                            if (err) {
                                                    logger.error('imageMagic write error: '+ err); 
                                                    return callback(err); 
                                            }
                                            logger.debug('The file has been re-named to: ' + fullPath);
                                            fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                                logger.debug('file is removed after renaming it');
                                            });  
                                            callback(null,fields,files,photoName);
                                            
                                        });  
                                    }else if(arg[2]){//grouplogo
                                        im(path)
                                        .resize(100,100,'!')
                                        .autoOrient()
                                        .write(fullPath,function(err){
                                            if (err) {
                                                    logger.error('imageMagic write error: '+ err); 
                                                    return callback(err); 
                                            }
                                            logger.debug('The file has been re-named to: ' + fullPath);
                                            fs.unlink(path, function() {	   //fs.unlink 删除用户上传的文件
                                                logger.debug('file is removed after renaming it');
                                            });   
                                            callback(null,fields,files,photoName);
                                        });  
                                    }

                                     
                            }//processUpload

                            processUpload();
                           



                        }//else               

                
                    });//form.parse

                }

            
        //  }catch(ex){
        //     return res.xhr ?
        //     res.json({error: '数据库错误！'}):
        //     res.redirect(303, '/response/error/500');
        //  }
         logger.debug('file'+ JSON.stringify(file.getData));
         return file;

};