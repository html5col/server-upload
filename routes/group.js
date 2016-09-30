"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../middlewares/auth');

const group = require('../controllers/group');

/* GET home page. */
module.exports = function(app){
      router.get('/groups', group.groups);
      router.get('/newGroup', auth.isLoggedIn, group.newGroup);
      router.post('/newGroupPost',group.newGroupUpload(app));
      router.get('/single/:group_id',group.singleGroup);
      router.get('/applyGroup',auth.isLoggedIn, group.applyGroup);
      //router.get('/askGroups',group.askGroups);

      return router;
};
