//./models/User.js
"use strict";
const mongoose = require('mongoose'),
     // helper = require('../lib/utility'),
      //logger = require('../lib/logger'),
      Schema = mongoose.Schema;

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
var userSchema = new Schema({ 
          //name: String,
     user_id: { type: String, required: true }, 
     name: { type: String, required: true},
     //country: { type: String, required: true},
     college: { type: String, required: true},
     experience: {type: String, required: true},
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

     choiceCountry: {type: String,required: true},
     choiceState: {type: String,required: true},
     choiceDetail: {type: String,required: true},
     fromCountry: {type: String,required: true},
     fromState: {type: String,required: true},
     status: {type: String,required: true},
     nativeLanguage: {type: String,required: true},
     secondLanguage: {type: String,required: true},

     visa: { type: String, required: true},
     studentsCertificate: { type: String, required: true},   
     personal: { type: String, required: true}, 
     drivePermit: { type: String, required: true}, 
     processing: { type: String, default: false},  
     inService: { type: String, default: false}
});

// userSchema.methods.time = time=> {
//     return moment(time).format('L');
// };

userSchema.methods.processExpat = user=>{
    return {
        _id: user._id,
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        college: user.college,
        experience: user.experience,
        choiceCountry: user.choiceCountry,
        choiceState: user.choiceState,
        choiceDetail: user.choiceDetail,
        fromCountry: user.fromCountry,
        fromState: user.fromState,
        status: user.status,
        nativeLanguage: user.nativeLanguage,
        secondLanguage: user.secondLanguage,
        //age: user.age,
        visa: user.visa,
        studentsCertificate: user.studentsCertificate,
        personal: user.personal,
        drivePermit: user.drivePermit ? user.drivePermit : null,
        processing: user.processing,
        inService: user.inService,
    };
};

// make this available to our users in our Node applications
module.exports = mongoose.model('Expat', userSchema);