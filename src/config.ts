interface ICiConfig {
  GITHUB_TOKEN: string;
  repoSlug: string;
}

export function getConfigFromEnv(): ICiConfig {
  const { GITHUB_TOKEN, REPO_SLUG } = process.env;

  if (!GITHUB_TOKEN) {
    console.log('Missing env var: "GITHUB_TOKEN"');
    process.exit(1);
  }
  if (!REPO_SLUG) {
    console.log('Missing env var: "REPO_SLUG"');
    process.exit(1);
  }
  const baseConfig: ICiConfig = {
    GITHUB_TOKEN,
    repoSlug: REPO_SLUG,
  };

  // if (process.env.TRAVIS) {
  //   const {
  //     TRAVIS_REPO_SLUG,
  //     // The pull request number if the current job is a pull request, “false” if it’s not a pull request.
  //     TRAVIS_PULL_REQUEST,
  //   } = process.env;
  //   return {
  //     ...baseConfig,
  //     repoSlug: TRAVIS_REPO_SLUG,
  //     // pullRequest: TRAVIS_PULL_REQUEST === 'false' ? false : TRAVIS_PULL_REQUEST,
  //   };
  // }

  return baseConfig;
}
