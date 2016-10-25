"use strict";
const User    = require('../models/User'),
      Post = require('../models/Post'),
      Group = require('../models/Group'),
      userProxy = require('../db_proxy/user'),
      moment = require('moment'),
      util = require('../lib/utility'),
      logger = require('../lib/logger'); 
//var utility = require('utility');                              


module.exports = {
      
      getGroupById: function(req,res,id,callback){

            let getGroup = new Promise(function(resolve,reject){
                let findOption = {'_id': `${id}`};
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
                //return group;                
                callback(group);
            }).catch(function(e){
                logger.error(`something wrong with the getGroup function : ${e}`);
                req.flash('error',`Error finding the single group!`);
                return res.redirect('/response/err/404');
            });

      },




};                       
                   
