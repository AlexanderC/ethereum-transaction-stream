const path = require('path');
const pkg = require('./package.json');
const { ProvidePlugin } = require('webpack'); 

module.exports = {
  entry: './src/index.js',
  mode: process.env.ENV || 'production',
  output: {
    filename: 'browser.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'EthTS',
    libraryTarget: 'umd',
  },
  node: {
    console: true,
    __filename: 'mock',
    __dirname: 'mock',
  },
  resolve: {
    alias: {
      'ws': path.resolve(__dirname, './shim/ws.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env',
              'modern-browsers',
              'stage-3',
            ],
            plugins: [
              'add-module-exports',
              'transform-runtime',
            ],
          },
        },
      },
    ],
  },
};