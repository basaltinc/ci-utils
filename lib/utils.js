const { execSync } = require('child_process');

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
 * @param {boolean} [short=false] - Return the shorter 6 character or full 40 character git sha
 * @returns {string} - Git SHA of HEAD
 */
function getGitSha(short = false) {
  if (short) {
    return sh('git rev-parse --short HEAD');
  }
  return sh('git rev-parse HEAD');
}

/**
 * @param {string} changelog - markdown string from a CHANGELOG
 * @param {string} repoSlug
 * @returns {{ issues: number[] }}
 */
function parseChangelog(changelog, repoSlug) {
  const [, ...others] = changelog.split(`${repoSlug}/issues/`);
  const issueResults = new Set(
    others.map(item => parseInt(item.match(/^\d*/)[0], 10)),
  );
  return {
    issues: [...issueResults],
  };
}

module.exports = {
  sh,
  getGitSha,
  parseChangelog,
};
