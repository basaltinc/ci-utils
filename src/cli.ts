#!/usr/bin/env node
import program from 'commander';
import fs from 'fs';
import { join } from 'path';
import {
  setGitHubStatus,
  createGitHubComment,
  createGitHubRelease,
  createGitHubDeployment,
  getRelatedPr,
  getPrInfoAsMd,
} from './github';
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
  .action((cmd) => {
    const { state, url, context, description } = cmd;
    if (!url) {
      console.log('URL (--url) must be passed in ', { url });
      process.exit(1);
    }
    return setGitHubStatus({
      state,
      url,
      context,
      description,
    }).then((results) => {
      if (results.errors) {
        console.log(results.errors);
        process.exit(1);
      }
      const isStateSame = state === results.state;
      const theUrl = !url.startsWith('http') ? `https://${url}` : url;
      const isUrlSame = theUrl === results.target_url;
      const isOk = isStateSame && isUrlSame && !!results.state;
      if (!isOk) {
        console.log({ isStateSame, isUrlSame, isOk }, results);
        process.exit(1);
      }
      console.log(`GitHub status set to: ${results.state}`);
      return true;
    });
  });

program
  .command('gh-comment')
  .description('Add comment to GitHub issue/pr')
  .option('-c, --comment [comment]', 'Comment; markdown ok')
  .option('-i, --issue [issue]', 'GitHub issue/PR id number', parseInt)
  .action((cmd) => {
    const { comment, issue } = cmd;
    return createGitHubComment(comment, issue).then((results) => {
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
  .action((cmd) => {
    const { tag, body, target } = cmd;
    return createGitHubRelease({ tag, body, target }).then((results) => {
      console.log(`GitHub release made: ${results.html_url}`);
      return true;
    });
  });

program
  .command('gh-deploy')
  .description('Sets GitHub deployment for last commit.')
  // .option(
  //   '--state [state]',
  //   'State [pending|error|failure|success]',
  //   /^(pending|error|failure|success)$/i,
  //   'success',
  // )
  .option('-u, --url [url]', 'Url')
  .option('--log-url <logUrl>', 'Log Url')
  .option('--env [env]', 'Environment', undefined, 'production')
  .option('-d, --description <description>', 'Description')
  .option('--prod', 'Is Production Environment')
  .option(
    '--not-transient-env',
    'Is this not a transient environment (i.e. will it exist in future after this specific deployment is gone?)',
  )
  .action((cmd) => {
    const {
      logUrl,
      url,
      env,
      description,
      prod: isProd,
      notTransientEnv,
    } = cmd;

    return createGitHubDeployment({
      url,
      logUrl,
      environment: env,
      description,
      isProdEnv: isProd,
      isTransientEnv: !notTransientEnv,
    }).then(() => {
      console.log(`GitHub deployment set`);
      return true;
    });
  });

program
  .command('gh-related-pr')
  .description('Gets GitHub PRs that this commit is on')
  .option('-c, --commit-sha [sha]', 'Git Commit SHA')
  .option(
    '--all-prs',
    'Should a comma separated list be returned with each PR found? Defaults to only returning first PR',
  )
  .action(({ commitSha, allPrs }) => {
    if (!commitSha) {
      console.log(`Must pass in a "--commit-sha 566ff87"`);
      process.exit(1);
    }

    return getRelatedPr({
      gitSha: commitSha,
    }).then((prs) => {
      if (prs.length === 0) {
        process.stderr.write(`No related PRs found for commit ${commitSha}`);
        return;
      }
      if (allPrs) {
        process.stdout.write(prs.map(({ number }) => number).join(','));
      } else {
        process.stdout.write(prs[0].number.toString());
      }
    });
  });

program
  .command('gh-pr-info-md')
  .description('Gets GitHub PR info as Markdown')
  .option('-n, --number [number]', 'GitHub PR Number')
  .option('--skip-body', 'Exclude body')
  .action(({ number, skipBody }) => {
    if (!number) {
      console.log(`Must pass in a "--number 123"`);
      process.exit(1);
    }

    return getPrInfoAsMd({
      number,
      skipBody,
    }).then((md) => {
      console.log(md);
    });
  });

program
  .command('banner <text>')
  .description(
    'Output banner of text in cli; useful for helping with CI log readability',
  )
  .action((text) => outputBanner(text));

program.parse(process.argv);
