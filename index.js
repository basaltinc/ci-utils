#!/usr/bin/env node
const program = require('commander');
// const fetch = require('node-fetch');
// const { execSync } = require('child_process');
const { version } = require('./package.json');

const { GITHUB_TOKEN } = process.env;

if (!GITHUB_TOKEN) {
  console.log('Missing env var: "GITHUB_TOKEN"');
  process.exit(1);
}

program.version(version, '-v, --version');

program
  .command('gh-status')
  .option(
    '-s, --state [state]',
    'State [pending|error|failure|success]',
    /^(pending|error|failure|success)$/i,
    'success',
  )
  .option('-u, --url <url>', 'Url')
  .option('-c, --context [context]', 'Context')
  .option('-d, --description [description]', 'Description')
  .action(cmd => {
    const { state, url, context, description } = cmd;
    console.log('gh-status', { state, url, context, description });
  });

program.parse(process.argv);
