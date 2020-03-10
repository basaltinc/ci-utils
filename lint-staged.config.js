module.exports = {
  linters: {
    '*.{js,ts}': [
      'yarn _eslint --quiet --fix', // @todo restore this, it's currently SLOOOOOW
      // './node_modules/.bin/prettier --write',
      'git add',
    ],
    'package.json': ['sort-npm-scripts', 'git add'],
  },
  ignore: [],
};
