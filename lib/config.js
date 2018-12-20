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
    repoSlug: '',
  };

  if (!baseConfig.GITHUB_TOKEN) {
    console.log('Missing env var: "GITHUB_TOKEN"');
    process.exit(1);
  }

  if (process.env.TRAVIS) {
    const { TRAVIS_REPO_SLUG } = process.env;
    return Object.assign({}, baseConfig, {
      repoSlug: TRAVIS_REPO_SLUG,
    });
  }

  return baseConfig;
}

module.exports = {
  getConfigFromEnv,
};
