const fetch = require('node-fetch');
const { getGitSha } = require('./utils');
const { getConfigFromEnv } = require('./config');

const { repoSlug, GITHUB_TOKEN } = getConfigFromEnv();

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
  return fetch(
    `https://api.github.com/repos/${repoSlug}/statuses/${getGitSha()}`,
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
    .catch(console.log.bind(console));
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
