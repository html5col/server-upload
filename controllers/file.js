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
    audio2(req,res){
        res.render('vip/file/audio2',{
				title:'the_Free_Internet音频学习',
				keywords:'X-Plan音频学习,Freedom House: Internet Continues to Become Less Free,英语听力,英语学习',
				description:'X-Plan音频学习,在线Freedom House: Internet Continues to Become Less Free音频及详细释义',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,				
		});
    },
    iceAge3(req,res){
        res.render('vip/file/movie_iceAge',{
				title:'Ice Age电影模仿学习',
				keywords:'X-Plan电影学习,Ice Age 3,英语电影, 电影资料',
				description:'X-Plan电影学习环节，模仿标准英语之旅',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,				
		});        
    },
	therapypig(req,res){
		res.render('vip/file/pigtherapy',{
				title:'Therapy Pig Brings Relief to Stressed Travelers音频学习',
				keywords:'X-Plan音频学习,Therapy Pig Brings Relief to Stressed Travelers,英语听力,英语学习',
				description:'X-Plan音频学习,在线Therapy Pig Brings Relief to Stressed Travelers音频及详细释义',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,					
		});
	},
	makeacall(req,res){
		res.render('vip/file/call',{
				title:'怎样打电话找人求助',
				keywords:'X-Plan音频学习,call for help,英语听力,英语学习',
				description:'X-Plan音频学习,在线 打电话找人 音频及详细释义',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,					
		});
	},
	enchanted(req,res){
		res.render('vip/file/movie_enchanted', {
				title:'Enchanted',
				keywords:'X-Plan视频学习,Enchanted,英语视频,英语学习',
				description:'X-Plan视频学习,在线 Enchanted 视频观看',						
				messages: {
					error: req.flash('error'),
					success: req.flash('success'),
					info: req.flash('info'),
				}, 
				user: req.user ? req.user.processUser(req.user) : req.user,				
		});

	}  

};