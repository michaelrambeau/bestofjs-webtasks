const webpack = require('webpack');
module.exports = {
  entry: './user-content-api/src/webtask.js',
  target: 'node',
  output: {
    path: './user-content-api/build/',
    filename: 'webtask.js',
    library: true,
    libraryTarget: 'commonjs2'
  },
  externals: {
    express: true,
    lodash: true,
    'body-parser': true,
    'webtask-tools': true,
    'isomorphic-fetch': true,
    mongoose: true,
    compression: true
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    // prefix the entire output text with this text
    new webpack.BannerPlugin('"use latest"\n', { raw: true, entryOnly: false })
  ],
  node: false,
  resolve: {
    modulesDirectories: ['node_modules'],
    root: __dirname,
    alias: {},
  }
};
