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
        Accept: [
          'application/vnd.github.v3+json',
          'application/vnd.github.ant-man-preview+json',
          'application/vnd.github.flash-preview+json',
        ].join(', '),
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
}): Promise<{
  state: string;
  target_url: string;
  errors?: {
    message: string;
  }[];
}> {
  return githubPost(`/repos/${repoSlug}/statuses/${getGitSha()}`, {
    state,
    target_url: url && !url.startsWith('http') ? `https://${url}` : url,
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

export async function createGitHubDeployment({
  logUrl,
  url,
  description,
  environment = 'production',
  isProdEnv = false,
  isTransientEnv = false,
}: {
  logUrl?: string;
  url: string;
  description?: string;
  environment?: string;
  isTransientEnv?: boolean;
  isProdEnv?: boolean;
}): Promise<void> {
  const ref = getGitSha();
  // https://developer.github.com/v3/repos/deployments/#create-a-deployment
  const ghDeployRes: {
    id: number;
    transient_environment: boolean;
    production_environment: boolean;
    statuses_url: string;
    environment: string;
    original_environment: string;
    task: string;
    creator: {}; // actually contains whole GitHub user who made it
  } = await githubPost(`/repos/${repoSlug}/deployments`, {
    ref,
    auto_merge: false,
    description,
    required_contexts: [], // The status contexts to verify against commit status checks. If you omit this parameter, GitHub verifies all unique contexts before creating a deployment. To bypass checking entirely, pass an empty array. Defaults to all unique contexts.
    environment,
    transient_environment: isTransientEnv, // default `false` - Specifies if the given environment is specific to the deployment and will no longer exist at some point in the future.
    production_environment: isProdEnv, // default `false` - Specifies if the given environment is one that end-users directly interact with
  }).catch(err => {
    console.log(err);
    console.log(`Error when creating GitHub deployment`);
    throw new Error(err);
  });
  const { creator, ...rest } = ghDeployRes;
  console.log('GitHub deployment made -----');
  console.log(rest);
  console.log('============');

  // https://developer.github.com/v3/repos/deployments/#create-a-deployment-status
  const deployStatusResults = await githubPost(
    `/repos/${repoSlug}/deployments/${ghDeployRes.id}/statuses`,
    {
      state: 'success',
      environment,
      log_url: logUrl,
      description,
      environment_url: url,
      auto_inactive: false,
    },
  ).catch(err => {
    console.log(err);
    console.log('Error when updating GitHub deployment status');
    throw new Error(err);
  });
}
