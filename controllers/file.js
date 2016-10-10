"use strict";
const File = require('../models/File');
module.exports = {

    downloadCount(req,res){
            let filename = req.query.name;
            let url = `/${filename}`;
            let file = new File();
            file.name = filename;
            file.save(function(err){
                console.log('saved successfully');
            });
            
            let update = { $inc: { 'pv': 1 }};//increment
            File.findOneAndUpdate({'name': filename}, update, function(err,file){
                if(err){
                    console.log(`there is error when update the pv: ${err}`);
                    return;
                }else if(file){
                    console.log(JSON.stringify(file));
                    //return;
                }

            }); 

             res.redirect(url);         

    },

};