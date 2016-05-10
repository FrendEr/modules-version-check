#!/usr/bin/env node

'use strict';
var mvc = require('../lib/modules-version-check');
var program = require('commander');
var pkg = require('../package.json');

program
  .version(pkg.version, '-v --version')
  .option('--match <regexp>', 'regular expression matching')
  .option('update', 'update local modules')
  .parse(process.argv);

mvc({
  match: program.match,
  update: program.update || false
});
