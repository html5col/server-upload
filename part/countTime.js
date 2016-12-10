"use strict";
const logger = require('../lib/logger');
let config = require('../config/config');
let User = require('../models/User');
module.exports.countTime = function(modifiedUsers){
   let latestRole, daySecs = 1000*60*60*24;
    modifiedUsers.forEach(function(user){
            latestRole = user.latestRole;//user has already been processUsered   
            let date  = new Date(),
                nowSecs = date.getTime();
            let vipTimeLeft,fdate,difference,fTime;

            if(latestRole == 'Trial'){
                    fdate  = new Date();
                    fdate.setDate(7);
                    fdate.setMonth(11);//need to be added by 1
                    fdate.setFullYear(2016);
                    if(nowSecs<fdate.getTime()){
                        difference = fdate.getTime() - nowSecs;
                        user.vipTimeLeft = Math.floor(difference / daySecs);
                        if(user.vipTimeLeft<1){
                            user.vipTimeLeft = 0;
                        }
                    }else if(nowSecs > fdate.getTime()){
                        //User.findById(user._id).sort('-')
                        User.findById(user._id,function(err,theUser){
                            if(err){
                                logger.error(`error when findByid in getUser in admin :${theUser}`);
                            }
                            theUser.local.roles = [];
                            theUser.save(function(err){
                                if (err){
                                    logger.error('save for deleting user roles: ' + err.stack);
                                    return;
                                }
                                logger.debug('save for deleting user roles' + JSON.stringify(theUser));
                                return;
                            });//save
                        });//user.findbyid


                    }      

            }else if(latestRole == 'Yearly'){
                    let sdate;
                    sdate  = new Date();
                    sdate.setDate(10);
                    sdate.setMonth(10);
                    sdate.setFullYear(2016);

                    let contractVipYear = config.contractVipYear;
                    //let now = new Date().getTime();
                    fTime =  sdate.getTime() + contractVipYear*28*daySecs;
                    if(nowSecs<fTime){
                        difference = fTime-nowSecs;
                        user.vipTimeLeft = Math.floor(difference / daySecs);
                    }else{
                        user.vipTimeLeft = 0;
                    }              
            }else if(latestRole == 'Super Admin' || latestRole == 'Super Admin' ){
                user.vipTimeLeft = 0;
            }else{
                user.vipTimeLeft = 0;
            }
            logger.debug(user.vipTimeLeft+' days left');
    });
};     
     
    