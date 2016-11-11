"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth');

const user = require('../../controllers/backend/user');

/* GET home page. */

router.get('/users', auth.allow(['Junior','Super']),user.getUsers);
//router.get('/vip/make', user.makeVip);
router.get('/vip/choose',auth.allow(['Junior','Super']), user.chooseVip);
router.get('/vip/delete', auth.allow(['Super']), user.deleteVip);

module.exports = router;
