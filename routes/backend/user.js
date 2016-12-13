"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth');

const user = require('../../controllers/backend/user');

/* GET home page. */

router.get('/users', user.getUsers);
router.get('/vips', user.vipUsers);
router.get('/expats', user.getExpats);
//router.get('/vip/make', user.makeVip);
router.get('/vip/choose', user.chooseVip);
router.get('/vip/delete', user.deleteVip);
router.get('/vip/count', user.xplanCount);
router.get('/vip/reset', user.reset);
router.get('/vip/add', user.add);
router.post('/vip/minus', user.minus);


module.exports = router;
