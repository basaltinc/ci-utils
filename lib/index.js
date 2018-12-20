const fetch = require('node-fetch');
const { execSync } = require('child_process');

let repoSlug;

const { GITHUB_TOKEN, TRAVIS } = process.env;

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

/**
 * @param {Object} opt
 * @param {string} opt.repoSlug - `org/repo`
 * @param {string} opt.state - one of: error, failure, pending, or success
 * @param {string} opt.url
 * @param {string} opt.context - unique id of status source
 * @param {string} opt.description - no links
 * @returns {Promise<Object>}
 * @link https://developer.github.com/v3/repos/statuses/
 */
function setGitHubStatus({ state, url, context, description }) {
  const gitShaLong = sh('git rev-parse HEAD');
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
  ).then(res => res.json());
}

module.exports = {
  setGitHubStatus,
};
