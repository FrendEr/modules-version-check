/**
 * return matched modules
 */
'use strict';
const forIn = require('lodash/forIn');

module.exports = (collection, regexp) => {
  const col = {};
  const regExp = new RegExp(regexp);

  forIn(collection, (value, name) => {
    if (regExp.test(name)) {
      col[name] = value;
    }
  });

  return col;
};
