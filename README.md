[![Greenkeeper badge](https://badges.greenkeeper.io/basaltinc/ci-utils.svg)](https://greenkeeper.io/)

# Continuous Integration Utilities by [Basalt](https://basalt.io)

Helps with common automation tasks helpful in CI builds and repo management.

## Usage

### Required Env Vars

We try to have as much set up through environmental variables as possible. These must be set:

- `GITHUB_TOKEN`

Additionally we're going to assume you're using Travis and have their env vars. More CIs and generic ways to set things will get fleshed out, but want to get the experience right first. If it's not Travis CI, please set these env vars:

- `REPO_SLUG` i.e. `user/repo`

### Commands

Will all, it's really best to run `npx ci-utils <command> --help`. Most common cases only are shown below.

#### Set GitHub Commit Status

Sets GitHub commit for last commit to that status. PR's show last commit's status.

```bash
npx ci-utils gh-status --state success --url http://example.com --description "It worked!!" --context "my-app/test"
```

#### Create GitHub Issue/PR Comment

```bash
npx ci-utils gh-comment --comment "Hello *world*" --issue 123
```

#### Create GitHub Release

```bash
npx ci-utils gh-release --tag "v1.2.3" --body "This release is *really* awesome" --target master
```

#### Banner

```bash
npx ci-utils banner "I'm a banner"


|======================
|
|  I'm a banner
|
|======================
```

### Node API

All commands can be used in node.js as well; for example to create a GitHub issue:

```js
const { createGitHubComment } = require('ci-utils');

createGitHubComment('Hello *world', 123).then(results => {
  console.log(results);
});
```

Most will not be documented in this readme, but should be pretty straightforward if you look in the `./lib` directory and at the exported functions and their JSdoc comments. All the CLI commands use these functions.

