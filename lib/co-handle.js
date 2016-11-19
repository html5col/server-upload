'use strict';
const co = require('co'),
  logger = require('./logger'),
  serverName = require('os').hostname(),
  cluster = require('cluster');

module.exports = (handle) => {
  return (req, res, next) => {
    co(handle(req, res, next))
            .catch((err) => {
              logger.error(`error in co-handle function ${err.message?err.message:err.stack}`);
              res.json({
                Code: -20000,
                Message: err.message === 'token不合法!'? 'token不合法!': '操作失败'
              });
            });
  };
};
