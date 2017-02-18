'use strict';
const co = require('co'),
  should = require('should'),
  client = require('../../lib/unittest-agent');

beforeEach(function() {
  console.log('before every test in every file in home page');
});
describe('Homepage',function(){
    describe("#get Groups and Comments",function(){
        it('should get both without any error',function(done){
            client
                .get('/')
                .query({'p':2})
                .end(function(err, res){
                    if(err){
                        throw err;
                    }
                   // console.log(res.body.Result);
                    res.should.be.html();
                    done();    
                });

            //done();     
            

        });
        
    });
});