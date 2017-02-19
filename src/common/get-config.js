'use strict';
const env = process.env.NODE_ENV || 'develop';
const config = require(`../../config.${env}.js`);
const  logger = require('../lib/logger');
// logger.debug(`env is ${env}`);

if (!config)
  throw new Error('配置文件`config.${env}.js`不存在!');

module.exports = config;
