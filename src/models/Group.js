//./models/group.js
// grab the things we need
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      logger = require('../lib/logger'),
      moment = require('moment');

var groupSchema = new Schema({

          user_id: { type: String, required: true },   
          //post_id: { type: String, required: true },    
          author: { type: String, required: true },
          title: { type: String, required: true, min: 3 },
          category: { type: String},
          intro: {type: String, required: true, min: 20},
          members: {type: Number, default: 0},
          private: {type: Boolean, default: 'false'},
          logo: { type: String, required: true },


          pv: {type: Number, default: 0},
          
          hidden: {type: Boolean, default: 'false'},
          
          meta: {
            votes: Number,
            favs:  Number,
            like: {type: Number, default: 0},
            great:{type: Boolean, default: 'false'},
          },          
          created_at: {type: Date, default: Date.now()},
          updated_at: {type: Date, default: Date.now()},
});



// on every save, add the date
groupSchema.pre('save', function(next) {
  // get the current date
  const currentDate = new Date();
  
  // change the updated_at field to current date: do not leave .local
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at){
    this.created_at = currentDate;
  }

  next();
});


groupSchema.methods.time = time=> {
    return moment(time).format('L');
};

groupSchema.methods.processGroup = group =>{

    // let tags = group.tags;
    // let tagsArray = tags.split(',');
    return {
        _id:group._id,
        user_id: group.user_id,   
        post_id: group.post_id,
        author: group.author,
        category: group.category,
        title: group.title,
        intro: group.intro,
        logo: group.logo,
        private: group.private,
        members: group.members,
        pv: group.pv,
        created_at: group.time(group.created_at),
        updated_at: group.time(group.updated_at),            
    };    

};

groupSchema.methods.user = (user_id,fn)=>{
          
         User.findById(user_id).exec((err,user)=>{
                if(err){
                    logger.error(`cannot catch user,error: ${err}`);
                    req.flash('error',`error in find user for ${user_id}`);
                    res.redirect('back');							
                }else{
                    //logger.debug(user);
                    let modifiedUser = user.processUser(user)
                    //logger.debug(modifiedUser);
                    fn(modifiedUser);
                  
              }
        });

};
// groupSchema.methods.getGroup = (id)=>{
//     let getGroup = new Promise(function(resolve,reject){
            
//     });
// };

// make this available to our users in our Node applications
module.exports = mongoose.model('Group', groupSchema);