"use strict";
const File = require('../models/File'),
      logger = require('../lib/logger');
module.exports = {

    downloadCount(req,res){
            let filename = req.query.name;
            let url = `/${filename}`;
            let file = new File();
            file.name = filename;
            file.save(function(err){
                logger.debug('saved successfully');
            });
            
            let update = { $inc: { 'pv': 1 }};//increment
            File.findOneAndUpdate({'name': filename}, update, function(err,file){
                if(err){
                    logger.error(`there is error when update the pv: ${err}`);
                    return;
                }else if(file){
                    logger.debug(JSON.stringify(file));
                    //return;
                }

            }); 

             res.redirect(url);         

    },

    audio1(req,res){
        res.render('vip/file/audio1',{
				title:'the_Quiet_Valley音频学习',
				keywords:'X-Plan音频学习,The Legend of Sleepy Hollow,英语听力,英语学习',
				description:'X-Plan音频学习',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,				
		});
    },

    

};