import http from 'https';
import { getGitSha } from './utils';
import { getConfigFromEnv } from './config';

const { repoSlug, GITHUB_TOKEN } = getConfigFromEnv();

if (!repoSlug) {
  console.log('Error: no repo slug found; please set via "REPO_SLUG" env var.');
  process.exit(1);
}

export function githubPost(path: string, requestBody: {}): Promise<any> {
  // eslint-disable-next-line
  return new Promise((resolve, reject) => {
    // @todo implement `reject()`
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

/**
 * Sets GitHub commit for last commit to that status. PR's show last commit's status.
 * @link https://developer.github.com/v3/repos/statuses/
 */
export function setGitHubStatus({
  state,
  url,
  context,
  description,
}: {
  state: 'error' | 'failure' | 'pending' | 'success';
  url: string;
  /** unique id of status source */
  context: string;
  description: string;
}): Promise<any> {
  return githubPost(`/repos/${repoSlug}/statuses/${getGitSha()}`, {
    state,
    target_url: url,
    context,
    description,
  });
}

/**
 * Add comment to GitHub issue/pr
 * @link https://developer.github.com/v3/issues/comments/#create-a-comment
 */
export function createGitHubComment(
  /** body, markdown ok */
  comment: string,
  issueId: number,
): Promise<any> {
  return githubPost(`/repos/${repoSlug}/issues/${issueId}/comments`, {
    body: comment,
  });
}

/**
 * Create GitHub release from tag
 * @link https://developer.github.com/v3/repos/releases/#create-a-release
 */
export function createGitHubRelease({
  tag,
  body,
  target = 'master',
}: {
  tag: string;
  body: string;
  target?: string;
}): Promise<any> {
  return githubPost(`/repos/${repoSlug}/releases`, {
    tag_name: tag,
    target_commitish: target,
    name: tag,
    body,
    draft: false,
    prerelease: false,
  });
}
