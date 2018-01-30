#!/usr/bin/env node

'use strict';
const program = require('commander');
const mvc = require('../lib/modules-version-check');
const pkg = require('../package.json');
let update = false;

// set version
program.version(pkg.version, '-v --version');

// set match
program.option('--match <regexp>', 'regular expression matching');

// set update cli
program.option('--cli <client>', 'update client, `npm` or `yarn`, default: `npm`')

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
  cli: program.cli,
  update: update
});
