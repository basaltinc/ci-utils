#!/usr/bin/env node
const program = require('commander');
const { setGitHubStatus } = require('./lib');
const { version } = require('./package.json');

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
    return setGitHubStatus({
      state,
      url,
      context,
      description,
    }).then(results => {
      console.log(`GitHub status set to: ${results.state}`);
      return true;
    });
  });

program.parse(process.argv);
