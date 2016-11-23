'use strict';
const co = require('co'),
  should = require('should'),
  client = require('../../lib/unittest-agent'),
  mongodb_fixture = require('../../lib/pow-mongodb-fixture-connect'),
  id = require('pow-mongodb-fixtures').createObjectId,  
  bcrypt = require('bcrypt-nodejs'),
  User = require('../../models/User');

beforeEach(function() {
  console.log('before every test in every file in login page');
});
describe('User System',function(){

    before(done=>{
        co(function* (){
            yield mongodb_fixture.clearAll();
        }).then(done,done);
    });

    describe("#user signup",function(){
        it('should login using a logined email and pw',function(done){
            const body = {
                username: 'ii',
                email: 'ii@ii.com',
                password:'iiiiii',
                confirmPassword: 'iiiiii',
            };
            function pw(pw){
               return bcrypt.hashSync(pw, bcrypt.genSaltSync(8), null);
            }
            client
                .post('/user/login')
                .send(body)
                .end(function(err, res){
                    co(function* (){
                        const user = yield User.
                                findOne({'username':'ii'})
                                .select({
                                    _id: 0,
                                    __v: 0,
                                    'local.created_at': 0,
                                    'local.updated_at': 0,
                                    'local.contractMoney': 0,
                                    'local.admin':0,
                                    'local.roles':0,
                                    'local.myGroups':0,
                                    'local.active':0,
                                    'local.failCount':0,
                                    'local.successCount':0,
                                    'local.resetPasswordToken':0, 
                                    'local.resetPasswordExpires':0,
                                    'local.neVip':0,
                                    'local.rewards': 0,  
                                    'local.meta': 0,
                                })
                                .exec();
                        user
                           .toObject()
                           .should
                           .deepEqual({
                               'username':'ii',
                               'email':'ii@ii.com',
                               'password':pw('iiiiii'),
                           });
                    }).then(done,done);               
                });

        });
    });
});