module.exports = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        // modules: false,
        targets: {
          node: '8',
        },
      },
    ],
    [
      require.resolve('@babel/preset-typescript'),
      {
        // isTSX: true,
        allExtensions: true,
        // jsxPragma: 'React',
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-optional-chaining'],
};
