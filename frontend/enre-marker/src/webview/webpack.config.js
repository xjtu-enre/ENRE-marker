/* eslint-disable no-console */
// @ts-check

const path = require('path');
const { DefinePlugin } = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { getThemeVariables } = require('antd/dist/theme');

// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig * */

const { NODE_ENV } = process.env;

const remoteAddress = process.env.REMOTE_ADDRESS;

if (NODE_ENV === 'production') {
  if (remoteAddress === undefined) {
    console.error('No REMOTE_ADDRESS set, this must be set in production build.');
    process.exit(-1);
  }

  console.log(`Using REMOTE_ADDRESS=${remoteAddress}`);
}

/** @type env: { browser?: boolean, extension?: boolean } => WebpackConfig */
const webviewConfig = (env) => ({
  target: 'web',
  mode: NODE_ENV,

  entry: './index.tsx',
  output: {
    path:
      {
        development: path.resolve(__dirname, env.extension ? '../../dist' : 'dist'),
        production: path.resolve(__dirname, '../../dist'),
      }[NODE_ENV],
    filename: 'webview.js',
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, '.static'),
    },
    historyApiFallback: {
      rewrites: [
        { from: /webview\.js/, to: '/webview.js' },
      ],
    },
    hot: true,
    port: 9000,
  },
  plugins: [
    ...{
      development: [],
      production: [
        new MiniCssExtractPlugin({
          filename: 'webview.css',
        }),
      ],
    }[NODE_ENV],
    new DefinePlugin({
      REMOTE:
        NODE_ENV === 'production'
          ? JSON.stringify(`http://${remoteAddress}/api/v1/`)
          : JSON.stringify('http://localhost:3000/api/v1/'),
      IS_PRODUCTION:
        NODE_ENV === 'production',
      IN_BROWSER:
        env.browser === true,
      IN_EXTENSION:
        env.extension === true,
    })],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.less', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                '@babel/preset-react',
              ],
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: { development: 'style-loader', production: MiniCssExtractPlugin.loader }[NODE_ENV],
          },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                /* Should be replaced since inline js will cause security issues.
                  See https://lesscss.org/usage/#less-options */
                javascriptEnabled: true,
                modifyVars: getThemeVariables({
                  dark: false,
                  compact: true,
                }),
              },
            },
          },
        ],
      },
    ],
  },
  optimization: {
    development: {},
    production: {
      usedExports: true,
      minimize: true,
      minimizer: [
        '...',
        new CssMinimizerPlugin(),
      ],
    },
  }[NODE_ENV],
  devtool: 'eval-cheap-source-map',
});

module.exports = webviewConfig;
