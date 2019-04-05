/**
 * @typedef {Object} CiConfig
 * @prop {string} GITHUB_TOKEN
 * @prop {string} repoSlug - i.e. 'user/repo'
 */

/**
 * @returns {CiConfig}
 */
function getConfigFromEnv() {
  const baseConfig = {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    repoSlug: process.env.REPO_SLUG,
  };

  if (!baseConfig.GITHUB_TOKEN) {
    console.log('Missing env var: "GITHUB_TOKEN"');
    process.exit(1);
  }

  if (process.env.TRAVIS) {
    const {
      TRAVIS_REPO_SLUG,
      // The pull request number if the current job is a pull request, “false” if it’s not a pull request.
      TRAVIS_PULL_REQUEST,
    } = process.env;
    return Object.assign({}, baseConfig, {
      repoSlug: TRAVIS_REPO_SLUG,
      pullRequest:
        TRAVIS_PULL_REQUEST === 'false' ? false : TRAVIS_PULL_REQUEST,
    });
  }

  return baseConfig;
}

module.exports = {
  getConfigFromEnv,
};
