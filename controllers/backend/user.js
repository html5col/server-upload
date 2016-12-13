"use strict";
const logger = require('../../lib/logger'),
      userProxy = require('../../db_proxy/user'),
      helper = require('../../lib/utility'),
      config  = require('../../common/get-config'),
      User = require('../../models/User'),
      Expat = require('../../models/Expat'),
      co_handle = require('../../lib/co-handle');

let user = {};
user.vipUsers = co_handle(function*(req,res,next){
    let findUsers = yield User.find().exec();
    //User.find({},function(err,users){
    //if(err){logger.error(err);}
    let vips = [];
    let modifiedUsers = userProxy.modifyUsers(findUsers); 
    require('../../part/countTime').countTime(modifiedUsers);
    // findUsers.forEach(function(usr){
    //     if(usr.local.neVip === true){
    //         next();
    //     }else if(usr.local.neVip == undefined){
    //         usr.local.neVip = false;
    //     }
        
    // });
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
user.getUsers = co_handle(function* (req,res,next){
       
        let users = yield User.find({}).exec();
        //let users = yield User.find({}).sort({'local.contractMoney': 1}).exec();
        let modifiedUsers = userProxy.modifyUsers(users); 
        require('../../part/countTime').countTime(modifiedUsers);

        res.render('backend/users',{
            user: req.user ? req.user.processUser(req.user) : req.user,
            siteUsers: modifiedUsers
        });     
});
user.getExpats = co_handle(function* (req,res,next){
       
        let users = yield Expat.find({}).exec();
        //let users = yield User.find({}).sort({'local.contractMoney': 1}).exec();
       

        res.render('backend/expats',{
            user: req.user ? req.user.processUser(req.user) : req.user,
            expats: users
        });     
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
                }else if(vip == 'falsevip'){
                    findUser.local.contractMoney = 0;
                    findUser.local.neVip = true;
                }

                existRoles.push(vip);
                //user.local.expiryDate = expireTime;
                findUser.save(function(err){
                    if (err){
                        logger.error('update error'+err.stack);
                        return;
                    }
                    logger.debug('vip update successfully'+JSON.stringify(findUser));
                    return res.redirect(301, '/admin/vips');

                });
             }else{
                 logger.debug('You\'ve already set the '+ vip);
                 req.flash('error','You\'ve already set the '+ vip);
                 return res.redirect(301, '/admin/vips');
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
            res.redirect('301, /admin/vips');

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
            res.redirect(301, '/admin/vips');
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
            res.redirect('/admin/vips');
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
                    res.redirect(301, '/admin/vips');
                }
        });
       // });   
});
user.add = co_handle(function*(req,res,next){
        let myid = req.query.user_id,
            add = req.query.add;
           // forFail = req.query.fail;
        logger.debug('user_id in failOne'+myid);
       // User.findOne({'_id': myid}, function(err,user){
        let findUser = yield User.findOne({'_id': myid}).exec();

        logger.debug('find user: '+ findUser);

        let modifiedUser = findUser.processUser(findUser), 
            //money = modifiedUser.contractMoney,
            role = modifiedUser.latestRole;

        if(add == 'success'){
            findUser.local.successCount = findUser.local.successCount + 1;
        }else if(add == 'fail'){
            findUser.local.failCount = findUser.local.failCount - 1;
        }

        findUser.save(function(err){
                if (err){
                    logger.error('add func fails'+err.stack);
                    return;
                }else{
                    logger.debug('add for id: '+ add +myid);
                    res.redirect(301, '/admin/vips');
                }
        });
       // });   
});

user.minus = co_handle(function*(req,res,next){
        let myid = req.query.user_id,
            reason = req.body.reason,
            minus = Number(req.body.minus);



        logger.debug('user_id in failOne'+myid);
        logger.debug(`reason is ${reason}`);
        let findUser = yield User.findOne({'_id': myid}).exec();

        logger.debug('find user: '+ findUser);

        if(isNaN(minus)){
            logger.debug('minus is not a number:' + minus);
        }else{
             findUser.local.contractMoney = Number(findUser.local.contractMoney) + minus;
        }
        
        if(reason){
            findUser.local.failReasons.push(reason);
        }

        findUser.save(function(err){
                if (err){
                    logger.error('add func fails' + err.stack);
                    return;
                }else{
                    logger.debug('add for id: ' +myid);
                    res.redirect(301, '/admin/vips');
                }
        });
       // });   
});
module.exports = user;