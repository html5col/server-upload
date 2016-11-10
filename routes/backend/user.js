"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth');

const user = require('../../controllers/backend/user');

/* GET home page. */

router.get('/users', user.getUsers);
router.get('/vip/make', user.makeVip);
router.post('/vip/delete', user.deleteVip);

module.exports = router;
