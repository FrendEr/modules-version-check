var should = require('should');
var filter = require('../util/filter');
var map = require('lodash/map');

var collection = {
  'grunt': '1.0.1',
  'lodash': '^4.5.1'
};

describe('#filter', function() {
  it('should return an collection with `grunt` packages', function() {
    var col = filter(collection, /gru/);

    map(col, function(value, name) {
      name.should.be.equal('grunt');
      value.should.be.equal('1.0.1');
    });
  });

  it('should return an collection with `lodash` packages', function() {
    var col = filter(collection, /lod/);

    map(col, function(value, name) {
      name.should.be.equal('lodash');
      value.should.be.equal('^4.5.1');
    });
  });
});
