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
      
      getGroupById: function(id){

           if(!id){
               logger.error(`no group id found ${id}`);
               return;
           }else{
            let getGroup = new Promise(function(resolve,reject){
                    Group.findById(id,function(err,group){
                        if(err){
                            logger.error(`page not found: no group wih group_id : ${id}`);
                            reject(err);
                            return;
                            //res.redirect('/response/error/404');
                        }
                        
                        resolve(group);
                    });
                });

                return getGroup;
           }


      },




};                       
                   
