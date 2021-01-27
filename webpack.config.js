const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: path.resolve(__dirname, 'src/index'),
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          'babel-loader',
          'eslint-loader'
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      }
    ]
  },
};
