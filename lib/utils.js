const { execSync, exec } = require('child_process');
const qs = require('querystring');
const http = require('http');

/**
 * @param {Object} opt
 * @param {string} opt.path
 * @param {Object} opt.requestBody
 * @param {string} opt.hostname
 * @param {string} opt.TOKEN
 * @param {Object} [opt.query]
 * @return {Promise<any>}
 */
function post({ path, requestBody, query, TOKEN }) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      hostname,
      path: query ? `${path}?${qs.stringify(query)}` : path,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `token ${TOKEN}`,
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
 * @param {string} opt.path
 * @param {string} opt.hostname
 * @param {string} opt.TOKEN
 * @param {Object} [opt.query]
 * @return {Promise<any>}
 */
function get({ path, query, hostname, TOKEN }) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname,
      path: query ? `${path}?${qs.stringify(query)}` : path,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `token ${TOKEN}`,
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

    req.end();
  });
}

/**
 * Output banner of text in cli; useful for helping with CI log readability
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
  get,
  post,
};
