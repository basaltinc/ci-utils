#!/usr/bin/env node
const program = require('commander');
const {
  setGitHubStatus,
  createGitHubComment,
  createGitHubRelease,
  outputBanner,
} = require('./lib');
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

program
  .command('gh-comment')
  .option('-c, --comment [comment]', 'Comment; markdown ok')
  .option('-i, --issue [issue]', 'GitHub issue/PR id number', parseInt)
  .action(cmd => {
    const { comment, issue } = cmd;
    return createGitHubComment(comment, issue).then(results => {
      console.log(`GitHub comment made: ${results.html_url}`);
      return true;
    });
  });

program
  .command('gh-release')
  .option('-t, --tag [tag]', 'Tag')
  .option('-b, --body [body]', 'Body; Markdown ok')
  .option(
    '--target [target]',
    'Target commitish; defaults to "master"',
    null,
    'master',
  )
  .action(cmd => {
    const { tag, body, target } = cmd;
    return createGitHubRelease({ tag, body, target }).then(results => {
      console.log(`GitHub release made: ${results.html_url}`);
      return true;
    });
  });

program.command('banner <text>').action(text => outputBanner(text));

program.parse(process.argv);
