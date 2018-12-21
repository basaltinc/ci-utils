const { execSync, exec } = require('child_process');

/**
 * @param {string} text
 * @return {void}
 */
function outputBanner(text) {
  console.log(`

|======================
|
|  ${text}
|
|======================
      `);
}

/**
 * Exec command sync and return output w/o showing.
 * @param {string} cmd - Shell command to run
 * @returns {string} - stdout results
 */
function runAndReturn(cmd) {
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
 * Run command async and stream output
 * @param {string} cmd - Shell command to run
 * @param {boolean} [banner=false] - should show banner at beginning and end of command output
 * @return {Promise<string>} - Output of command
 */
function runAndShow(cmd, banner = false) {
  return new Promise((resolve, reject) => {
    if (banner) outputBanner(`Running "${cmd}"`);
    const child = exec(cmd, {
      encoding: 'utf8',
    });
    let stdout = '';
    child.stdout.on('data', data => {
      stdout += data;
      process.stdout.write(data);
    });
    child.stderr.on('data', data => {
      process.stdout.write(data);
    });
    child.on('close', code => {
      if (code > 0) {
        process.stdout.write(
          `Error with code ${code} after running: ${cmd} \n`,
        );
        process.exit(code);
        reject();
      } else {
        if (banner) outputBanner(`Ran: "${cmd}"`);
        resolve(stdout);
      }
    });
  });
}

/**
 * @param {boolean} [short=false] - Return the shorter 6 character or full 40 character git sha
 * @returns {string} - Git SHA of HEAD
 */
function getGitSha(short = false) {
  if (short) {
    return runAndReturn('git rev-parse --short HEAD');
  }
  return runAndReturn('git rev-parse HEAD');
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
  runAndReturn,
  runAndShow,
  getGitSha,
  parseChangelog,
  outputBanner,
};
