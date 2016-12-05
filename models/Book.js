//./models/User.js
"use strict";
const mongoose = require('mongoose'),
     // helper = require('../lib/utility'),
      //logger = require('../lib/logger'),
      Schema = mongoose.Schema;

var bookSchema = new Schema({
          //name: String,
     user_id: { type: String, required: true }, 
     name: { type: String, required: true},
     phone: { 
         type: String, 
         required: true
        //  validate: {
        //      validator: function(v){
        //          return /\d{10-12}/.test(v);
        //      },
        //      message:'{VALUE} is not a valid phone number!'
        //  },
        //  required: [true, 'Phone Number required!'],

    },

     targetLanguage: {type: String,required: true},
     livingLocation: {type: String,required: true},
     intro: {type: String,required: true},
     identity: {type: String,required: true},

     familyPic: {type: String,required: true},
     houseOwnerVerify: {type: String,required: true},
     processing: { type: String, default: false},  
     inService: { type: String, default: false},  
});

// userSchema.methods.time = time=> {
//     return moment(time).format('L');
// };

bookSchema.methods.processBook = book=>{
    return {
        _id: book._id,
        _user_id: book.user_id,
        name: book.name,
        phone: book.phone,

        targetLanguage: book.targetLanguage,
        intro: book.intro,
        identity: book.identity,
        familyPic: book.default,
        houseOwnerVerify: book.houseOwnerVerify,
        processing: book.processing,
        inService: book.inService,
        livingLocation: book.livingLocation,
    };
};

// make this available to our users in our Node applications
module.exports = mongoose.model('Book', bookSchema);