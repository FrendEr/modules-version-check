'use strict';
var forIn = require('lodash/forIn');

module.exports = function(collection, regexp) {
  var col = {};
  var regExp = new RegExp(regexp);

  forIn(collection, function(value, name) {
    if (regExp.test(name)) {
      col[name] = value;
    }
  });

  return col;
};
