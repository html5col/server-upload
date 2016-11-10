"use strict";
const logger = require('../../lib/logger'),
      userProxy = require('../../db_proxy/user'),
      User = require('../../models/User');
module.exports = {

    getUsers(req,res){
        User.find({},function(err,users){
            // logger.debug(`users: ${JSON.stringify(users)}`);  
            let modifiedUsers = userProxy.modifyUsers(users); 
            logger.debug(`modifiedUsers: ${JSON.stringify(modifiedUsers)}`);  
            
            res.render('backend/users',{
                user: req.user ? req.user.processUser(req.user) : req.user,
                siteUsers: modifiedUsers
            });
        });

    },
    makeVip(req,res){
        let myid = req.query.user_id;
        logger.debug('user_id'+myid);

        let update = {$set:{'local': { 'vip': true }}};//increment
        let conditions = {'_id':myid};
        let options = {runValidators:true};
        User.findOne({'_id': myid}, function(err,user){
 
              if (err){
                  logger.error('findOne error'+err.stack);
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

            user.local.vip = true;
            user.save(function(err){
                if (err){
                    logger.error('update error'+err.stack);
                    return;
                }
                logger.debug('save done');
                res.redirect('/admin/users');

            });


        });
        // User.update(conditions, update,options, function(err,user){

        //       if (err){
        //           logger.error('updateVip error'+err.stack);
        //           return;
        //       }
        //          logger.debug('new User: '+ user);
        //         res.redirect('back');
        // });
        // User.update({'_id':id},{'local':{'vip':true}},{safe: true,upsert: true}, function(err){
        //       if (err){
        //           logger.error('updateViip error'+err.stack);
        //           return;
        //       }
        //     //   logger.debug('new User: '+ user);
        //         res.redirect('back');

        // });
        
    },

    deleteVip(req,res){

    },

};