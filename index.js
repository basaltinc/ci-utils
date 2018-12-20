#!/usr/bin/env node
const program = require('commander');
const fetch = require('node-fetch');
const { execSync } = require('child_process');
const { version } = require('./package.json');

let repoSlug;
const { GITHUB_TOKEN, TRAVIS } = process.env;

if (!GITHUB_TOKEN) {
  console.log('Missing env var: "GITHUB_TOKEN"');
  process.exit(1);
}

if (TRAVIS) {
  const { TRAVIS_REPO_SLUG } = process.env;
  repoSlug = TRAVIS_REPO_SLUG;
}

if (!repoSlug) {
  console.log('Missing repoSlug');
  process.exit(1);
}

/**
 * @param {string} cmd
 * @returns {string} - stdout results
 */
function sh(cmd) {
  try {
    return execSync(cmd, {
      encoding: 'utf8',
    }).trim();
  } catch (error) {
    console.log(`Uh oh. Error running "${cmd}"`, error);
    process.exit(1);
  }
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
    const gitShaLong = sh('git rev-parse HEAD');
    const { state, url, context, description } = cmd;
    // console.log('gh-status', { state, url, context, description, gitShaLong });
    return fetch(
      `https://api.github.com/repos/${repoSlug}/statuses/${gitShaLong}`,
      {
        method: 'POST',
        body: JSON.stringify({
          state,
          target_url: url,
          context,
          description,
        }),
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      },
    )
      .then(res => res.json())
      .then(results => {
        console.log(`GitHub status set to: ${results.state}`);
      });
  });

program.parse(process.argv);
