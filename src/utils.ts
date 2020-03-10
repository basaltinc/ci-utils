import { execSync, exec } from 'child_process';
import qs from 'querystring';
import http from 'http';

export function post({
  path,
  hostname,
  requestBody,
  query,
  TOKEN,
}: {
  hostname: string;
  path: string;
  requestBody: {};
  query?: {};
  TOKEN: string;
}): Promise<Record<string, any>> {
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
      const chunks: any[] = [];

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

export function get({
  path,
  query,
  hostname,
  TOKEN,
}: {
  hostname: string;
  path: string;
  query?: {};
  TOKEN: string;
}) {
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
      const chunks: any[] = [];

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
 */
export function outputBanner(text: string): void {
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
 * @returns stdout results
 */
export function runAndReturn(
  /** Shell command to run */
  cmd: string,
): string {
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
 */
export function runAndShow(
  /** Shell command to run */
  cmd: string,
  /** should show banner at beginning and end of command output */
  banner = false,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (banner) outputBanner(`Running "${cmd}"`);
    const child = exec(cmd, {
      encoding: 'utf8',
    });
    let stdout = '';
    if (child.stdout) {
      child.stdout.on('data', data => {
        stdout += data;
        process.stdout.write(data);
      });
    }
    if (child.stderr) {
      child.stderr.on('data', data => {
        process.stdout.write(data);
      });
    }
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
 * @returns Git SHA of HEAD
 */
export function getGitSha(
  /** Return the shorter 6 character or full 40 character git sha */
  short = false,
): string {
  if (short) {
    return runAndReturn('git rev-parse --short HEAD');
  }
  return runAndReturn('git rev-parse HEAD');
}

export function parseChangelog(
  changelog: string,
  repoSlug: string,
): { issues: number[] } {
  const [, ...others] = changelog.split(`${repoSlug}/issues/`);
  if (!others) {
    return {
      issues: [],
    };
  }
  const issueResults = new Set<number>();
  others.forEach(item => {
    const matches = item.match(/^\d*/);
    if (matches) {
      const match = matches.length > 0 ? matches[0] : null;
      if (match) issueResults.add(parseInt(match, 10));
    }
  });
  return {
    issues: [...issueResults],
  };
}
