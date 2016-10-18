//./models/Post.js
// grab the things we need
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      Tag = require('../models/Tag'),
      Comment = require('./Comment'),
      Group  = require('./Group'),
      moment = require('moment');

// create a schema
//The allowed SchemaTypes are:
// String
// Number
// Date
// Buffer
// Boolean
// Mixed
// ObjectId
// Array
var postSchema = new Schema({

          user_id: { type: String, required: true },
          tag_id: [String],          
          group_id: { type: String, required: true },
          author: { type: String, required: true },
          title: { type: String, required: true, min: 4 },
          //category: { type: String, required: true },
          content: { type: String, required: true, min:100 },//,match: /[0-9a-zA-Z_-]/
          //intro: {type: String, required: true, min: 20},
          //comments: [{ body: String, date: Date }],
          pv: {type: Number, default: 0},
          image: String,
          like: {type: Number, default: 0},
          hidden: {type: Boolean, default: 'false'},
          great:{type: Boolean, default: 'false'},
          meta: {
            votes: Number,
            favs:  Number
          },          
          created_at: {type: Date, default: Date.now()},
          updated_at: {type: Date, default: Date.now()},
     
   
});



// on every save, add the date
postSchema.pre('save', function(next) {
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


postSchema.methods.time = time=> {
    return moment(time).format('L');
};

postSchema.methods.processPost = (post)=>{

    let tag_idArray = post.tag_id;
    let tagsArray = [];
    tag_idArray.forEach(function(v,i,a){  
          Tag.findById(v,function(err,tag){
               tagsArray.push(tag);
          });
    });
    // let articleUser;
    // User.findById(post.user_id,function(err,user){
    //             if(err){
    //                 console.log(err);
    //             }else{
    //                 articleUser = user;
    //                 callback(articleUser);
    //                 console.log('articleUser is ' + JSON.stringify(articleUser));
    //             }
    //         });

    // return {
    //     articleUser:articleUser, //return 'undefined'
    // };

    return {
        _id:post._id,
        user_id: post.user_id,
        tag_id: post.tag_id,  //an array   
        group_id: post.group_id,
        //group: group,
        //commentsNumber: comments.length,
        tags: tagsArray,//array with all post tags   
        author: post.author,
        //articleUser: articleUser,

        //category: post.category,
        title: post.title,
        intro: post.content.slice(0,100),
        content: post.content,  
        image:post.image,
        pv: post.pv,

        created_at: post.time(post.created_at),
        updated_at: post.time(post.updated_at),            
    };  



};

postSchema.methods.group = (group_id,callback)=>{
    let getGroup = new Promise(function(resolve,reject){
        let findOption = {'_id': group_id};
        Group.findOne(findOption,function(err,group){
            if(err){
                console.log(`group not found: no group wih title : ${group.title}`);
                reject(err);
                //res.redirect('/response/error/404');
            }else{
                let modifiedGroup = group.processGroup(group);
                resolve(modifiedGroup);
            }
        });
    });

    getGroup.then(function(group){
        //return group;
        callback(group);
    }).catch(function(e){
        console.log(`something wrong with the getGroup function in postSchema.methods.group  : ${e}`);
        req.flash('error',`Error finding the single group!`);
        return res.redirect('/response/err/404');
    });

};

postSchema.methods.user = (user_id,callback)=>{
          
         User.findById(user_id).exec((err,user)=>{
                if(err){
                    console.log(`cannot catch user,error: ${err}`);
                    req.flash('error',`error in find user for ${user_id}`);
                    res.redirect('back');							
                }else{
                    console.log(user);
                    let modifiedUser = user.processUser(user)
                    console.log(modifiedUser);
                    callback(modifiedUser);
                  
              }
        });

};


postSchema.methods.comments = (post_id,fn)=>{
    Comment.find({'post_id':post_id},function(err,comments){
        if(err){
            console.log(`error in getting comments: ${err}`);
            req.flash('error',`Error in getting comments`);
            res.redirect('back');            
        }else{
            comments =  comments.map(function(comment){
                return comment.processComment(comment);
            });
            fn(comments);
        }

    });
};

// make this available to our users in our Node applications
module.exports = mongoose.model('Post', postSchema);