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

module.exports = {
  sh,
  getGitSha,
};
