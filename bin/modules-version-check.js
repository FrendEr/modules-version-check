#!/usr/bin/env node

'use strict';
const program = require('commander');
const mvc = require('../lib/modules-version-check');
const pkg = require('../package.json');
let update = false;

// set version
program.version(pkg.version, '-v --version');

// get match
program.option('--match <regexp>', 'regular expression matching');

// auto update
program
  .command('update')
  .description('update local modules')
  .action(() => {
    update = true;
  });

// get argvs
program.parse(process.argv);

// run check
mvc({
  match: program.match,
  update: update
});
