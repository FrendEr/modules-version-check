'use strict';
var path = require('path');
var urllib = require('urllib');
var bagpipe=  require('bagpipe');
var chalk = require('chalk');
var semver = require('semver');
var size = require('lodash/size');
var forIn = require('lodash/forIn');
var emoji = require('node-emoji');
var table = require('text-table');
var spawn = require('cross-spawn-async');
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var ping = require('ping');

var filter = require('../util/filter');
var verify = require('../util/verify');
var verifyMain = verify.main;
var getVersionInfo = verify.getVersionInfo;
var getMatchMaxVersion = verify.getMatchMaxVersion;

var REGISTRY_URL = require('../util/interface');
var pkg = require(path.join(process.cwd(), 'package.json'));

function modulesVersionCheck(options, callback) {
  var dependencies = pkg.dependencies;
  var queue = new bagpipe(10, {timeout: 10000});
  var depsSize = 0;
  var record = 0;
  var nameList = [];
  var count = 0;
  var flag = false;
  var tableText = [];
  callback = typeof callback === 'function' ? callback : function() {};

  if (options.match) {
    dependencies = filter(dependencies, options.match);
  }
  depsSize = size(dependencies)

  if (depsSize) {
    forIn(dependencies, function(value, name) {
      (function (name, version) {
        ping.promise.probe(REGISTRY_URL.npmRegistry)
        .then(function(res) {
          var url = res.alive ? REGISTRY_URL.npmRegistry : REGISTRY_URL.cNpmRegistry;
          queue.push(urllib.request, url + '/' + name, function(err, result) {
            if (++count == depsSize) {
              flag = true;
            }
            var errmsg = '';
            var localPkg = {};

            try {
              localPkg = require(path.join(process.cwd(), 'node_modules', name, 'package.json'));
            } catch(e) {
              console.log(
                chalk.red('Can\'t find ') +
                chalk.yellow(name) +
                chalk.red(' \'s package.json, please run') +
                chalk.bold(' `npm install ' + name + '` ') +
                chalk.red('to install this package correctly.')
              );
              process.exit(1);
            }

            if (err) {
              errmsg = err.message;
            } else {
              try {
                result = getVersionInfo(JSON.parse(result));
              } catch(e) {
                errmsg = 'parse origin package info error. ' + err.message;
                result = {};
              }
            }

            if (errmsg) {
              console.log('An error occurred when checking ' + chalk.red(name) + '\'s updates, Error: ' + chalk.red(err.message));
            }

            var matchMaxVersion = getMatchMaxVersion(result.versionsList, version);

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

            if (flag && record) {
              console.log('');
              tableText.unshift([
                chalk.bold('#'),
                chalk.bold('modules'),
                chalk.bold('latest'),
                chalk.bold('max-available'),
                chalk.bold('target'),
                chalk.bold('current')
              ]);
              var renderedTable = table(tableText, {
                stringLength: s => chalk.stripColor(s).length
              });
              console.log(renderedTable);

              var err = record > 1 ? ' errors' : ' error';
              console.log('');
              console.log(
                emoji.get(':warning:'),
                chalk.red(' You get ') + record + chalk.red(err) + chalk.red(' in local packages, please run ') +
                chalk.bold(' `npm install ') + chalk.red(' to update. ')
              );

              if (!options.update) {
                callback();
                process.exit(1);
              }

              console.log('');
              console.log('Install...(If an error occurred during the automatic installation, try to run `install npm` manually for installation)');
              console.log('npm install ' + nameList.join(' '));

              var installAsync = async(function() {
                var installAwait = await(function() {
                  var argv = ['install'];
                  for (var i = 0; i < nameList.length; i++) {
                    argv.push(nameList[i]);
                  }
                  spawn('npm', argv, {
                    stdio: 'inherit'
                  });
                });
              });
              installAsync().then(function() {
                callback();
              });
            }

            if (flag && !record) {
              console.log(emoji.get(':tada:'), chalk.green(' All modules version check pass!'));
              callback();
              process.exit(0);
            }

          });
        });
      })(name, dependencies[name]);
    });
  } else {
    console.log(emoji.get(':tada:'), chalk.green(' All modules version check pass!'));
    callback();
    process.exit(0);
  }
}

module.exports = modulesVersionCheck;
