const prettierConfig = require('./prettier.config');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'jsdoc', 'promise', '@typescript-eslint'],
  extends: [
    'airbnb',
    'prettier',
    'plugin:@typescript-eslint/recommended',
    //    "plugin:promise/recommended" @todo turn this back and .then() fix every error
  ],
  globals: {
    document: true,
    window: true,
    fetch: true,
  },
  settings: {
    'import/resolver': {
      // use an array of glob patterns
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root/>@types` directory even it doesn't contain any source code, like `@types/unist`
        // can glob
        directory: ['./tsconfig.json'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.ts', '*.tsx'],
      // extends: 'plugin:@typescript-eslint/recommended',
      rules: {
        '@typescript-eslint/camelcase': [0],
        '@typescript-eslint/explicit-function-return-type': [0],
        '@typescript-eslint/interface-name-prefix': [
          2,
          {
            prefixWithI: 'always',
            // allowUnderscorePrefix: true,
          },
        ],
        '@typescript-eslint/no-empty-function': [0],
        'valid-jsdoc': [0],
      },
    },
  ],
  rules: {
    'consistent-return': [0],
    'import/no-extraneous-dependencies': [0],
    'import/prefer-default-export': [0],
    'import/dynamic-import-chunkname': [0],
    'import/no-dynamic-require': [0],
    'import/extensions': [
      2,
      {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    ],
    'jsdoc/check-types': 'error',
    'no-console': [0],
    'default-case': [0],
    'no-unused-vars': [1],
    'no-inner-declarations': [0],
    'no-param-reassign': [
      1,
      {
        props: false,
      },
    ],
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'no-useless-constructor': 'off',
    // 'lines-between-class-members': ['2', 'always', { exceptAfterSingleLine: true }],
    'prettier/prettier': ['error', prettierConfig],

    strict: [0],
  },
};
