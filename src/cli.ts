#!/usr/bin/env node
import program from 'commander';
import fs from 'fs';
import { join } from 'path';
import { setGitHubStatus, createGitHubComment, createGitHubRelease } from '.';
import { outputBanner } from './utils';

const { version } = JSON.parse(
  fs.readFileSync(join(__dirname, '../package.json'), 'utf8'),
);

program.version(version, '-v, --version');

program
  .command('gh-status')
  .description(
    "Sets GitHub commit for last commit to that status. PR's show last commit's status.",
  )
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
  .description('Add comment to GitHub issue/pr')
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
  .description('Create GitHub release from tag')
  .option('-t, --tag [tag]', 'Tag')
  .option('-b, --body [body]', 'Body; Markdown ok')
  .option(
    '--target [target]',
    'Target commitish; defaults to "master"',
    undefined,
    'master',
  )
  .action(cmd => {
    const { tag, body, target } = cmd;
    return createGitHubRelease({ tag, body, target }).then(results => {
      console.log(`GitHub release made: ${results.html_url}`);
      return true;
    });
  });

program
  .command('banner <text>')
  .description(
    'Output banner of text in cli; useful for helping with CI log readability',
  )
  .action(text => outputBanner(text));

program.parse(process.argv);