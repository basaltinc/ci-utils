const fetch = require('node-fetch');
const http = require('https');
const { getGitSha } = require('./utils');
const { getConfigFromEnv } = require('./config');

const { repoSlug, GITHUB_TOKEN } = getConfigFromEnv();

/**
 * @param {string} path
 * @param {Object} requestBody
 * @return {Promise<any>}
 */
function githubPost(path, requestBody) {
  // eslint-disable-next-line
  return new Promise((resolve, reject) => {// @todo implement `reject()`
    const options = {
      method: 'POST',
      hostname: 'api.github.com',
      path,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'CiUtils',
      },
    };

    const req = http.request(options, res => {
      const chunks = [];

      res.on('data', chunk => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const responseBody = Buffer.concat(chunks);
        resolve(JSON.parse(responseBody.toString()));
      });
    });

    // console.log({ requestBody });
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

/**
 * @param {Object} opt
 * @param {string} opt.state - one of: error, failure, pending, or success
 * @param {string} opt.url
 * @param {string} opt.context - unique id of status source
 * @param {string} opt.description - no links
 * @returns {Promise<Object>}
 * @link https://developer.github.com/v3/repos/statuses/
 */
function setGitHubStatus({ state, url, context, description }) {
  return githubPost(`repos/${repoSlug}/statuses/${getGitSha()}`, {
    state,
    target_url: url,
    context,
    description,
  });
}

/**
 * @param {string} comment - body, markdown ok
 * @param {number} issueId
 * @return {Promise<Object>}
 */
function createGitHubComment(comment, issueId) {
  return fetch(
    `https://api.github.com/repos/${repoSlug}/issues/${issueId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({
        body: comment,
      }),
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    },
  )
    .then(res => res.json())
    .catch(console.log.bind(console));
}

module.exports = {
  setGitHubStatus,
  createGitHubComment,
};
