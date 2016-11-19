"use strict";
const logger = require('../../lib/logger'),
      userProxy = require('../../db_proxy/user'),
      helper = require('../../lib/utility'),
      config  = require('../../config/config'),
      User = require('../../models/User'),
      co_handle = require('../../lib/co-handle');

let user = {};
user.getUsers = co_handle(function* (req,res,next){
       
        let users = yield User.find({}).exec();
        //let users = yield User.find({}).sort({'local.contractMoney': 1}).exec();
        let modifiedUsers = userProxy.modifyUsers(users); 
        require('../../part/countTime').countTime(modifiedUsers);

        res.render('backend/users',{
            user: req.user ? req.user.processUser(req.user) : req.user,
            siteUsers: modifiedUsers
        });     



        // User.find({},function(err,users){

        //     //delete the vip user's vip state  when they are out of date. And tell us how many dates left 
        //     let modifiedUsers = userProxy.modifyUsers(users); 
        //    let contractLeft,latestRole,contractPerMonth;
        //    let daySecs = 1000*60*60*24;
            
        //     modifiedUsers.forEach(function(user){
        //              latestRole = user.latestRole;//user has already been processUsered   
        //             let date  = new Date(),
        //                 nowSecs = date.getTime();
        //             let vipTimeLeft,fdate,difference,fTime;

        //             if(latestRole == 'Trial'){
        //                     fdate  = new Date();
        //                     fdate.setDate(7);
        //                     fdate.setMonth(11);//need to be added by 1
        //                     fdate.setFullYear(2016);
        //                     if(nowSecs<fdate.getTime()){
        //                         difference = fdate.getTime() - nowSecs;
        //                         user.vipTimeLeft = Math.floor(difference / daySecs);
        //                     }else if(nowSecs > fdate.getTime()){
        //                         User.findById(user._id,function(err,theUser){
        //                             if(err){
        //                                 logger.error(`error when findByid in getUser in admin :${theUser}`);
        //                             }
        //                             theUser.local.roles = [];
        //                             theUser.save(function(err){
        //                                 if (err){
        //                                     logger.error('save for deleting user roles: ' + err.stack);
        //                                     return;
        //                                 }
        //                                 logger.debug('save for deleting user roles'+JSON.stringify(theUser));
        //                                 return;
        //                             });//save
        //                         });//user.findbyid


        //                     }      




        //             }else if(latestRole == 'Yearly'){
        //                     let sdate;
        //                     sdate  = new Date();
        //                     sdate.setDate(10);
        //                     sdate.setMonth(10);
        //                     sdate.setFullYear(2016);

        //                     let contractVipYear = config.contractVipYear;
        //                     //let now = new Date().getTime();
        //                     fTime =  sdate.getTime() + contractVipYear*28*daySecs;
        //                     if(nowSecs<fTime){
        //                         difference = fTime-nowSecs;
        //                         user.vipTimeLeft = Math.floor(difference / daySecs);
        //                     }else{
        //                         user.vipTimeLeft = 0;
        //                     }              
        //             }else if(latestRole == 'Super Admin' || latestRole == 'Super Admin' ){
        //                 user.vipTimeLeft = 'Infinite';
        //             }else{
        //                 user.vipTimeLeft = 0;
        //             }
        //             logger.debug(user.vipTimeLeft+' days left');
        //     });



        //     res.render('backend/users',{
        //         user: req.user ? req.user.processUser(req.user) : req.user,
        //         siteUsers: modifiedUsers
        //     });
        // });
});
user.chooseVip = co_handle(function*(req,res,next){
       
       let myid = req.query.user_id,
           vip = req.query.vip;

        logger.debug(`user_id: ${myid} ; vip: ${vip}`);
        
        let findUser = yield User.findOne({'_id': myid}).exec();
        //User.findOne({'_id': myid}, function(err,user){
 
            //   if (err){
            //       logger.error('findOne error'+err.stack);
            //       return;
            //   }
              logger.debug('find user: '+ findUser);
              //let modifyUser = user.processUser(user);

             let existRoles = findUser.local.roles; 

             let alreadyExist = existRoles.some(function(v){
                 return v === vip;
             });

             if(!alreadyExist){

                if(vip == 'Trial'){
                    logger.debug('entering into trial');
                    findUser.local.contractMoney =  99;
                }else if(vip == 'Yearly'){
                     logger.debug('entering into vip');
                    findUser.local.contractMoney = 588;
                }

                existRoles.push(vip);
                //user.local.expiryDate = expireTime;
                findUser.save(function(err){
                    if (err){
                        logger.error('update error'+err.stack);
                        return;
                    }
                    logger.debug('vip update successfully'+JSON.stringify(findUser));
                    return res.redirect('/admin/vips');

                });
             }else{
                 logger.debug('You\'ve already set the '+ vip);
                 req.flash('error','You\'ve already set the '+ vip);
                 return res.redirect('/admin/vips');
             }

       // }); 
});
user.deleteVip = co_handle(function*(req,res,next){
        let myid = req.query.user_id;
        logger.debug('user_id in delete'+myid);

        //let update = {$set:{'local': { 'vip': false }}};//increment
        //let conditions = {'_id':myid};
        //let options = {runValidators:true};
        let findUser = yield User.findOne({'_id': myid}).exec();
 
        // if (err){
        //     logger.error('findOne error in delete vip func'+err.stack);
        //     return;
        // }
        logger.debug('find user: '+ findUser);

        //   user.update({''},{'local':{'vip':true}}, function(err,user){
        //     if (err){
        //         logger.error('updateViip error'+err.stack);
        //         return;
        //     }
        //        //logger.debug('new User: '+ user);
        //         res.redirect('back');                 
        //   });

        //user.local.vip = false;
        findUser.local.roles = [];
        findUser.save(function(err){
            if (err){
                logger.error('update error'+err.stack);
                return;
            }
            logger.debug('vip deleted done for id: '+myid);
            res.redirect('/admin/vips');

        });
});
user.xplanCount = co_handle(function*(req,res,next){
        let myid = req.query.user_id,
            query = req.query.result;
        logger.debug('user_id in failOne'+myid);
       // User.findOne({'_id': myid}, function(err,user){
        let findUser = yield User.findOne({'_id': myid}).exec();

        logger.debug('find user: '+ findUser);

        let modifiedUser = findUser.processUser(findUser), 
            money = modifiedUser.contractMoney,
            role = modifiedUser.latestRole;

        if(Number(money) === 0){
            logger.error('error','Cannot set it below 0');
            res.redirect(303, '/admin/vips');
        }
        if(query == 'failOne'){
            let punish = 0;
            if(role == 'Trial'){
                punish = 24.75;
            }else if(role == 'Yearly'){
                punish = 18.375;
            }
            findUser.local.contractMoney = money - punish;
            findUser.local.failCount = findUser.local.failCount - 1;
        }else if(query == 'successOne'){
            findUser.local.successCount = findUser.local.successCount + 1;
        }


        findUser.save(function(err){
                if (err){
                    logger.error('money lose function fails'+err.stack);
                    return;
                }else{
                    logger.debug('vip lose money for id: '+myid);
                    res.redirect('/admin/users');
                }
        });
       // });   
});
user.reset = co_handle(function*(req,res,next){
        let myid = req.query.user_id,
            reset = req.query.reset;
           // forFail = req.query.fail;
        logger.debug('user_id in failOne'+myid);
       // User.findOne({'_id': myid}, function(err,user){
        let findUser = yield User.findOne({'_id': myid}).exec();

        logger.debug('find user: '+ findUser);

        let modifiedUser = findUser.processUser(findUser), 
            money = modifiedUser.contractMoney,
            role = modifiedUser.latestRole;

        if(Number(money) === 0){
            logger.error('error','already 0');
            res.redirect(303, '/admin/vips');
        }
        if(reset == 'success'){
            findUser.local.successCount = 0;
            
        }else if(reset == 'fail'){
            findUser.local.failCount = 0;
        }


        findUser.save(function(err){
                if (err){
                    logger.error('reset fails'+err.stack);
                    return;
                }else{
                    logger.debug('reset for id: '+myid);
                    res.redirect('/admin/users');
                }
        });
       // });   
});

user.vipUsers = co_handle(function*(req,res,next){
    let findUsers = yield User.find().exec();
    //User.find({},function(err,users){
    //if(err){logger.error(err);}
    let vips = [];
    let modifiedUsers = userProxy.modifyUsers(findUsers); 
    require('../../part/countTime').countTime(modifiedUsers);
    modifiedUsers.forEach(function(user){
        let roles = user.roles;
        if(roles[0]){
            vips.push(user);
        }
    });
    
    logger.debug(`the vips array ${JSON.stringify(vips)}`);
    res.render('backend/vips',{
            user: req.user ? req.user.processUser(req.user) : req.user,
            vips: vips               
    });
    //});
});
// module.exports = {
//     chooseVip(req,res){
//     },
//     deleteVip(req,res){
//     },
//     failOne(req,res){
//     },
//     vipUsers(req,res){
//     },
// };

module.exports = user;