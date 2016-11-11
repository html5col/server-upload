"use strict";
const logger = require('../../lib/logger'),
      userProxy = require('../../db_proxy/user'),
      helper = require('../../lib/utility'),
      User = require('../../models/User');
module.exports = {

    getUsers(req,res){
        User.find({},function(err,users){
            // logger.debug(`users: ${JSON.stringify(users)}`);  
            let modifiedUsers = userProxy.modifyUsers(users); 
           // logger.debug(`modifiedUsers: ${JSON.stringify(modifiedUsers)}`);  

           let vip = req.user.processUser(req.user).vip;
            //let time = helper.getTime();
        let date  = new Date(),
            year = date.getFullYear(),
            month = date.getMonth(),
            day = date.getDate();

        let fdate, fyear,fmonth,fday;           

        let endDate,endTime,startTime,expireTime;
        switch (vip){
            case 'Trial':
                // endDate = helper.getTime(30*24*60*60*1000),
                fdate  = new Date(30*24*60*60*1000),
                fyear = fdate.getFullYear(),
                fmonth = fdate.getMonth(),
                fday = fdate.getDate(); 

                startTime = `${month}.${day},${year}`,
                endTime = `${fmonth}.${fday},${fyear}`;
                expireTime = `${startTime} - ${endTime}`;     
                break;
            case 'Yearly':
                fdate  = new Date(8*30*24*60*60*1000),
                fyear = fdate.getFullYear(),
                fmonth = fdate.getMonth(),
                fday = fdate.getDate(); 
                startTime = `${month}.${day},${year}`,
                endTime = `${fmonth}.${fday},${fyear}`;
                expireTime = `${startTime} - ${endTime}`;     
                break;     
        }
        logger.debug(`change vip time ${month}.${day},${year}`);
        logger.debug(`change vip time ${fmonth}.${fday},${fyear}`);
            
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
        
        let time = helper.getTime();


        let endDate,endTime,startTime,expireTime;
        switch (vip){
            case 'Trial':
                endDate = helper.getTime(30*24*60*60*1000),
                startTime = `${time.month}.${time.day},${time.year}`,
                endTime = `${endDate.month}.${endDate.day},${endDate.year}`;
                expireTime = `${startTime} - ${endTime}`;     
                break;
            case 'Yearly':
                endDate = helper.getTime(8*30*24*60*60*1000),
                startTime = `${time.month}.${time.day},${time.year}`,
                endTime = `${endDate.month}.${endDate.day},${endDate.year}`;
                expireTime = `${startTime} - ${endTime}`;     
                break;     
        }
       
        logger.debug(`change vip time ${time.month}.${time.day},${time.year}`);
        logger.debug(`change vip time ${endDate.month}.${endDate.day},${endDate.year}`);

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
                existRoles.push(vip);
                user.local.expiryDate = expireTime;
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

            user.local.vip = false;
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

};