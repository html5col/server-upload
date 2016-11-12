"use strict";
const logger = require('../../lib/logger'),
      userProxy = require('../../db_proxy/user'),
      helper = require('../../lib/utility'),
      config  = require('../../config/config'),
      User = require('../../models/User');
module.exports = {

    getUsers(req,res){
        User.find({},function(err,users){

            //delete the vip user's vip state  when they are out of date. And tell us how many dates left 
            let modifiedUsers = userProxy.modifyUsers(users); 
           let contractLeft,latestRole,contractPerMonth;
           let daySecs = 1000*60*60*24;
            
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
                            }else if(nowSecs > fdate.getTime()){
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
                                        logger.debug('save for deleting user roles'+JSON.stringify(theUser));
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
                        user.vipTimeLeft = 'Infinite';
                    }else{
                        user.vipTimeLeft = 0;
                    }
                    logger.debug(user.vipTimeLeft+' days left');
            });



            res.render('backend/users',{
                user: req.user ? req.user.processUser(req.user) : req.user,
                siteUsers: modifiedUsers
            });
        });

    },
    chooseVip(req,res){
       let myid = req.query.user_id,
           vip = req.query.vip;

        logger.debug(`user_id: ${myid} ; vip: ${vip}`);
        

        User.findOne({'_id': myid}, function(err,user){
 
              if (err){
                  logger.error('findOne error'+err.stack);
                  return;
              }
              logger.debug('find user: '+ user);
              //let modifyUser = user.processUser(user);

             let existRoles = user.local.roles; 

             let alreadyExist = existRoles.some(function(v){
                 return v === vip;
             });

             if(!alreadyExist){

                if(vip == 'Trial'){
                    logger.debug('entering into trial');
                    user.local.contractMoney =  99;
                }else if(vip == 'Yearly'){
                     logger.debug('entering into vip');
                    user.local.contractMoney = 588;
                }

                existRoles.push(vip);
                //user.local.expiryDate = expireTime;
                user.save(function(err){
                    if (err){
                        logger.error('update error'+err.stack);
                        return;
                    }
                    logger.debug('vip update successfully'+JSON.stringify(user));
                    return res.redirect('/admin/users');

                });
             }else{
                 logger.debug('You\'ve already set the '+ vip);
                 req.flash('error','You\'ve already set the '+ vip);
                 return res.redirect('/admin/users');
             }




        }); 
        // let roles =user.local.roles;
// User.findOne({'_id': myid}, function(err,user){
//         User.findByIdAndUpdate(
//                 myid,
//                 {$push: {[user.local.rules]: vip}},
//                 {safe: true, upsert: true, new : true},
//                 function(err, user) {
//                         if (err){
//                             logger.error('update error'+err.stack);
//                             return;
//                         }
//                         logger.debug('vip update successfully'+ JSON.stringify(user));
//                         res.redirect('/admin/users');
//                 }
//         );

// });

    },
    // makeVip(req,res){
    //     let myid = req.query.user_id;
    //     logger.debug('user_id'+myid);

    //     // let update = {$set:{'local': { 'vip': true }}};//increment
    //     // let conditions = {'_id':myid};
    //     // let options = {runValidators:true};
    //     User.findOne({'_id': myid}, function(err,user){
 
    //           if (err){
    //               logger.error('findOne error'+err.stack);
    //               return;
    //           }
    //           logger.debug('find user: '+ user);

    //         //   user.update({''},{'local':{'vip':true}}, function(err,user){
    //         //     if (err){
    //         //         logger.error('updateViip error'+err.stack);
    //         //         return;
    //         //     }
    //         //        //logger.debug('new User: '+ user);
    //         //         res.redirect('back');                 
    //         //   });

    //         user.local.vip = true;
    //         user.save(function(err){
    //             if (err){
    //                 logger.error('update error'+err.stack);
    //                 return;
    //             }
    //             logger.debug('save done');
    //             res.redirect('/admin/users');

    //         });


    //     });
    //     // User.update(conditions, update,options, function(err,user){

    //     //       if (err){
    //     //           logger.error('updateVip error'+err.stack);
    //     //           return;
    //     //       }
    //     //          logger.debug('new User: '+ user);
    //     //         res.redirect('back');
    //     // });
    //     // User.update({'_id':id},{'local':{'vip':true}},{safe: true,upsert: true}, function(err){
    //     //       if (err){
    //     //           logger.error('updateViip error'+err.stack);
    //     //           return;
    //     //       }
    //     //     //   logger.debug('new User: '+ user);
    //     //         res.redirect('back');

    //     // });
        
    // },

    deleteVip(req,res){
        let myid = req.query.user_id;
        logger.debug('user_id in delete'+myid);

        //let update = {$set:{'local': { 'vip': false }}};//increment
        //let conditions = {'_id':myid};
        //let options = {runValidators:true};
        User.findOne({'_id': myid}, function(err,user){
 
              if (err){
                  logger.error('findOne error in delete vip func'+err.stack);
                  return;
              }
              logger.debug('find user: '+ user);

            //   user.update({''},{'local':{'vip':true}}, function(err,user){
            //     if (err){
            //         logger.error('updateViip error'+err.stack);
            //         return;
            //     }
            //        //logger.debug('new User: '+ user);
            //         res.redirect('back');                 
            //   });

            //user.local.vip = false;
            user.local.roles = [];
            user.save(function(err){
                if (err){
                    logger.error('update error'+err.stack);
                    return;
                }
                logger.debug('vip deleted done for id: '+myid);
                res.redirect('/admin/users');

            });
        });
    },


    failOne(req,res){
        let myid = req.query.user_id;
        logger.debug('user_id in delete'+myid);
        User.findOne({'_id': myid}, function(err,user){
 
              if (err){
                  logger.error('findOne error in delete vip func'+err.stack);
                  return;
              }
              logger.debug('find user: '+ user);

              let modifiedUser = user.processUser(user), 
                  money = modifiedUser.contractMoney,
                  role = modifiedUser.latestRole;

             if(Number(money) === 0){
                 logger.error('error','Cannot set it below 0');
                 res.redirect(303, '/admin/users');
             }else{
                let punish;
                if(role == 'Trial'){
                    punish = 24.75;
                }else if(role == 'Yearly'){
                    punish = 18.375;
                }
                user.local.contractMoney = money - punish;
                user.save(function(err){
                        if (err){
                            logger.error('money lose function fails'+err.stack);
                            return;
                        }
                        logger.debug('vip lose money for id: '+myid);
                        res.redirect('/admin/users');

                });
             }


            


        });







    },

};