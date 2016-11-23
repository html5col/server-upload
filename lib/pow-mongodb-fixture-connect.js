'use strict';
//const config = require('../config/config').db.mongo;
const fixtures = require('pow-mongodb-fixtures').connect('groupForum');
//const fixtures = require('pow-mongodb-fixtures').connect('mongodb://localhost/groupForum');

function clearAll() {
  return new Promise((resolve, reject) => {
    fixtures.clear(function(err) {
      if(err) {
        reject();
      }
      else {
        resolve();
      }
    });
  });
}

function clearAllAndLoad(data) {
  return new Promise((resolve, reject) => {
    fixtures.clearAllAndLoad(data, function(err) {
      if(err) {
        reject();
      }
      else {
        resolve();
      }
    });
  });
}

module.exports = {
  clearAll,
  clearAllAndLoad
};
