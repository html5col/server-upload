//./models/Post.js
// grab the things we need
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      moment = require('moment');


var fileSchema = new Schema({

          user_id: { type: String},
          name: String,
          pv: {type: Number, default: 0},
          votes: Number,
          created_at: {type: Date, default: Date.now()},
          updated_at: {type: Date, default: Date.now()},
});



// on every save, add the date
fileSchema.pre('save', function(next) {
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


fileSchema.methods.time = time=> {
    return moment(time).format('L');
};

// make this available to our users in our Node applications
module.exports = mongoose.model('File', fileSchema);