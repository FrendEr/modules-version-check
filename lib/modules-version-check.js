/**
 * entry
 */
'use strict';
const path = require('path');
const urllib = require('urllib');
const chalk = require('chalk');
const size = require('lodash/size');
const forIn = require('lodash/forIn');
const table = require('text-table');
const spawn = require('cross-spawn-async');
const co = require('co');

const filter = require('../util/filter');
const verify = require('../util/verify');
const verifyMain = verify.main;
const getVersionInfo = verify.getVersionInfo;
const getMatchMaxVersion = verify.getMatchMaxVersion;

const REGISTRY_URL = require('../util/interface');
const cwd = process.cwd();
const pkg = require(path.join(cwd, 'package.json'));

module.exports = modulesVersionCheck;

function modulesVersionCheck(options, callback) {
  const cb = typeof callback === 'function' ? callback : () => {};
  const nameList = [];
  const tableText = [];
  let dependencies = pkg.dependencies;
  let depsSize = 0;
  let record = 0;
  let count = 0;
  let isFinish = false;

  if (options.match) {
    dependencies = filter(dependencies, options.match);
  }

  depsSize = size(dependencies);

  if (!depsSize) {
    console.log('\n🎉 ', chalk.green('All modules\' version check pass!\n'));
    cb();
    return;
  }

  forIn(dependencies, (value, name) => {
    ((name, version) => {
      co(function* () {
        let localPkg;
        let result = yield urllib.requestThunk(REGISTRY_URL.npmRegistry + '/' + name);

        if (++count == depsSize) {
          isFinish = true;
        }

        try {
          localPkg = require(path.join(cwd, 'node_modules', name, 'package.json'));
        } catch(e) {
          console.log(
            chalk.red('Can\'t found ') +
            chalk.yellow(name) +
            chalk.red(' \'s package.json, please run') +
            chalk.bold(' `npm install ' + name + '` ') +
            chalk.red('to install this package correctly')
          );
          process.exit(1);
        }

        try {
          result = getVersionInfo(name, JSON.parse(result.data));
        } catch(e) {
          console.log(
            'An error occurred when checking ' +
            chalk.red(name) +
            '\'s updates, Error: ' +
            chalk.red('parse origin package info error. ' + e)
          );
          process.exit(1);
        }

        const matchMaxVersion = getMatchMaxVersion(result.versionsList, version);

        if (verifyMain(result.version, matchMaxVersion, version, localPkg.version)) {
          record++;
          nameList.push(name + '@' + matchMaxVersion);
          tableText.push([
            record,
            chalk.italic(name),
            chalk.green(result.version),
            chalk.cyan(matchMaxVersion),
            chalk.yellow(version),
            chalk.red(localPkg.version)
          ]);
        }

        if (isFinish && record) {
          console.log('\n');
          tableText.unshift([
            chalk.bold('#'),
            chalk.bold('modules'),
            chalk.bold('latest'),
            chalk.bold('max-available'),
            chalk.bold('target'),
            chalk.bold('current')
          ]);
          const renderedTable = table(tableText, {
            stringLength: s => chalk.stripColor(s).length
          });
          console.log(renderedTable);

          const err = record > 1 ? ' errors were' : ' error was';
          const autoTips = options.update ? '' : chalk.red(' , please run') + chalk.bold(' `modules-version-check udpate`') + chalk.red(' to update before your build');
          console.log(
            '\n⚠️ ',
            record + chalk.red(err) + chalk.red(' found in local packages') +
            autoTips
          );

          if (!options.update) {
            cb();
            return;
          }

          console.log('\n📦 ', 'Installing... (if an error occurred during the automatic installation, try to run `npm install` manually for installation)');
          console.log('npm install ' + nameList.join(' '));

          const argv = ['install'];
          nameList.map((name) => {
            argv.push(name);
          });
          const installation = spawn('npm', argv, {
            stdio: 'inherit'
          });
          installation.on('close', () => {
            cb();
          });
        }

        if (isFinish && !record) {
          console.log('\n🎉 ', chalk.green('All modules\' version check pass!\n'));
          cb();
        }
      }).catch((err) => {
        console.log(chalk.red(err));
        process.exit(1);
      });
    })(name, value);
  });
}
