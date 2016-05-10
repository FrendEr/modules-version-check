var should = require('should');
var verify = require('../util/verify');
var verifyMain = verify.main;
var getVersionInfo = verify.getVersionInfo;
var getMatchMaxVersion = verify.getMatchMaxVersion;

describe('#verify', function() {
  describe('verify.main', function() {
    it('should return false, because don\'t get latest version', function() {
      verifyMain(null, '1.0.1', '1.0.0', '1.0.0').should.be.equal(false);
    });
    it('should return false, because don\'t get target version', function() {
      verifyMain('1.0.2', '1.0.1', null, '1.0.0').should.be.equal(false);
    });
    it('should return false, because don\'t get current version', function() {
      verifyMain('1.0.2', '1.0.1', '1.0.1', null).should.be.equal(false);
    });
    it('should return false with (\'0.4.1\', null, \'0.4.2\', \'0.2.1\'), because target version is over latest version', function() {
      verifyMain('0.4.1', null, '0.4.2', '0.2.1').should.be.equal(false);
    });
    it('should return false with (\'0.4.1\', null, \'0.2.8\', \'0.2.1\'), because target version is not exist', function() {
      verifyMain('0.4.1', null, '0.2.8', '0.2.1').should.be.equal(false);
    });

    it('should return true with (\'0.4.1\', \'0.4.1\', \'^1.0.0\', \'0.2.1\')', function() {
      verifyMain('0.4.1', '0.4.1', '^1.0.0', '0.2.1').should.be.equal(true);
    });
    it('should return true with (\'0.4.1\', \'0.2.4\', \'^0.2.0\', \'0.2.1\')', function() {
      verifyMain('0.4.1', '0.2.4', '^0.2.0', '0.2.1').should.be.equal(true);
    });
  });

  describe('verify.getVersionInfo', function() {

  });

  describe('verify.getMatchMaxVersion', function() {
    var versionsList1 = [
      '1.0.1',
      '0.4.8',
      '0.4.7',
      '0.4.0',
      '0.1.0'
    ];
    var targetVersion1 = '^0.4.2';
    it('should return a version 0.4.8', function() {
      getMatchMaxVersion(versionsList1, targetVersion1).should.be.ok;
    });

    var versionsList2 = [
      '1.0.1',
      '0.4.8',
      '0.4.7',
      '0.4.0',
      '0.1.0'
    ];
    var targetVersion2 = '0.4.2';
    it('should return null', function() {
      (null === getMatchMaxVersion(versionsList2, targetVersion2)).should.be.true;
    });

    var versionsList3 = [
      '1.0.1',
      '0.4.8',
      '0.4.7',
      '0.4.0',
      '0.1.0'
    ];
    var targetVersion3 = '^1.0.0';
    it('should return a version 1.0.1', function() {
      getMatchMaxVersion(versionsList3, targetVersion3).should.be.ok;
    });
  });
});
