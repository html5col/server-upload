'use strict';
const co = require('co'),
  should = require('should'),
  client = require('../../lib/unittest-agent'),
  mongodb_fixture = require('../../lib/pow-mongodb-fixture-connect'),
  id = require('pow-mongodb-fixtures').createObjectId,  
  Post = require('../../models/Post');

beforeEach(function() {
  console.log('before every test in every file in post page');
});
describe('Post System',function(){

    before(done=>{
        co(function* (){
            yield mongodb_fixture.clearAll();
        }).then(done,done);
    });

    describe.only("#post function",function(){
        it('the post editted should be done',function(done){

            const id1 = id(),
                  user_id = id(),
                  tag_id = id(),
                  group_id = id(),
                  author = 'Liweidong';
            const fixtures = {
            posts: [
                {
                    _id: id1,
                    user_id: user_id,
                    tag_id: tag_id,          
                    group_id: group_id,
                    author: author,
                    title: 'this is test post',
                    content: 'testpost content sih dkkdjf kdfjkdjfk djfkdjfkd',
                    pv: 5,
                    image: 'this.png',
                    like: 50,
                    hidden: false,
                    great:false,
                    meta: {
                        votes:5,
                        favs: 5
                    },          
                    created_at: Date.now(),
                    updated_at: Date.now(),
                }
            ]
            };

            beforeEach(done => {
                co(function* (){
                    yield mongodb_fixture.clearAllAndLoad(fixtures);
                }).then(done,done);
            });

            const body = {
                title: 'modified post',
                content: 'modified post modified post modified post modified post modified post',
                photo:'test.png',
                group_id: group_id,
            };

            client
                
                .post(`http://localhost:8000/post/edit/${id1}`)
                .auth('dd@dd.com', 'dddddd')
                //.type('form')
                .send(body)
                //.expect(200, done)
                // .expect(function(res) {
                //     res.body.title = 'modified post';
                //     res.body.photo = 'test.png';
                // })
                .end(function(err, res){
                    if(err) return done(err);
                    co(function* (){
                        const post = (yield Post.
                                findOne({'_id':id1,'group_id':group_id})
                                .exec());
                        post
                           //.toObject()
                           .title
                           .should
                           .equal('modified postkdjfk');
                    }).then(done,done);  
                    done();             
                });
         
        });
    });
});