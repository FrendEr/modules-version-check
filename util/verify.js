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

exports.getVersionInfo = (name, result, isCnpm) => {    // `isCnpm` 说明用的是淘宝的 npm 源（备注：淘宝源跟 npm 源返回的版本列表排序不一致，一个升序，一个降序）
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
    versionsList: isCnpm ? versionsList.reverse() : versionsList
  };
};

exports.getMatchMaxVersion = (versionsList, targetVersion, latestVersion) => {
  let maxVersion;
  versionsList = versionsList || [];

  if (targetVersion === 'latest') {
    return latestVersion || versionsList[0];
  }

  for (let i = 0; i < versionsList.length; i++) {
    const v = versionsList[i];
    if (semver.satisfies(v, targetVersion)) {
      maxVersion = v;
    }
  }

  if (latestVersion && semver.lt(latestVersion, maxVersion)) {    // 兼容 latest 版本小于发布历史最新版本的情况
    maxVersion = latestVersion;
  }

  return maxVersion;
};
