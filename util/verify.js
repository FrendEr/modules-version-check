'use strict';
var semver = require('semver');

exports.main = function(latest, max, target, current) {
  if (!latest || !target || !current) {
    return false;
  }

  if ((!semver.satisfies(current, target) && max) || (semver.satisfies(current, target) && max && max != current)) {
    return true;
  }

  return false;
};

exports.getVersionInfo = function(result) {
  var latest = result['dist-tags']['latest'];
  var versions = result.versions;
  var versionsList = [];

  for (var v in versions) {
    versionsList.push(v);
  }

  return {
    version: latest,
    versionsList: versionsList
  };
};

exports.getMatchMaxVersion = function(versionsList, targetVersion) {
  for (var i = 0; i < versionsList.length; i++) {
    var v = versionsList[i];
    if (semver.satisfies(v, targetVersion)) {
      return v;
    }
  }
  return null;
};
