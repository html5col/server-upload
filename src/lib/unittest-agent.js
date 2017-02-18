'use strict';
const supertest = require('supertest');
const server = require('../app.js');
const client = supertest.agent(server);
module.exports = client;