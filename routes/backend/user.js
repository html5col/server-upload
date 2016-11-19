"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth');

const user = require('../../controllers/backend/user');

/* GET home page. */

router.get('/users', user.getUsers);
router.get('/vips', user.vipUsers);
//router.get('/vip/make', user.makeVip);
router.get('/vip/choose', user.chooseVip);
router.get('/vip/delete', user.deleteVip);
router.get('/vip/count', user.xplanCount);

module.exports = router;
