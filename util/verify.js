/**
 * version verify util
 */
'use strict';
const semver = require('semver');
const chalk = require('chalk');

exports.main = (latest, max, target, current) => {
  if (!latest || !target || !current) {
    return false;
  }

  if ('latest' === target) {
    target = max;
  }

  if ((!semver.satisfies(current, target) && max) || (semver.satisfies(current, target) && max && max != current)) {
    return true;
  }

  return false;
};

exports.getVersionInfo = (name, result) => {
  if (!result || !result['dist-tags']) {
    throw new Error('Can\'t get version info about ' + chalk.bold(chalk.white(name)));
  }

  const latest = result['dist-tags'].latest;
  const versions = result.versions;
  const versionsList = [];

  for (const v in versions) {
    versionsList.push(v);
  }

  return {
    version: latest,
    versionsList: versionsList
  };
};

exports.getMatchMaxVersion = (versionsList, targetVersion) => {
  let maxVersion;
  versionsList = versionsList || [];

  if (targetVersion === 'latest') {
    return versionsList[0];
  }

  for (let i = 0; i < versionsList.length; i++) {
    const v = versionsList[i];
    if (semver.satisfies(v, targetVersion)) {
      maxVersion = v;
    }
  }

  return maxVersion;
};
