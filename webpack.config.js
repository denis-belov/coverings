/*
eslint-disable
array-element-newline,
no-console,
camelcase
*/

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
  entry: './src/index.js',

  resolve: {
    extensions: [ '.js', '.scss' ],
    modules: [ './node_modules' ],
    descriptionFiles: [ 'package.json' ],
  },

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'index.js',
    publicPath: '/',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'eslint-loader' },
        ],
      },

      {
        test: /\.cpp$/,
        use: [
          {
            loader: '../xgk-cpp-webpack-loader/build/index.js',
            options: {
              execute: 'make -f /home/denis/reps/denis-belov/audiospace/src/cpp/makefile',
              target: '/home/denis/reps/denis-belov/audiospace/src/cpp/build/js/main.js',
              watch_file: [
                '/home/denis/reps/denis-belov/xgk-math/makefiles/emcc/makefile',
                '/home/denis/reps/denis-belov/audiospace/src/cpp/makefile',
              ],
              watch_dir: [
                '/home/denis/reps/denis-belov/xgk-math/src',
                '/home/denis/reps/denis-belov/audiospace/src/cpp/src',
              ],
              entry: '/home/denis/reps/denis-belov/audiospace/src/cpp/src/main.cpp',
            },
          },
        ],
      },

      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },

      {
        test: /\.pug$/,
        use: [
          { loader: 'html-loader' },
          { loader: 'pug-html-loader' },
        ],
      },

      {
        test: /\.html$/,
        use: [ { loader: 'html-loader', options: { minimize: true } } ],
      },

      {
        test: /\.(png|jpg|jpeg)$/,
        use: [ { loader: 'base64-inline-loader' } ],
      },
    ],
  },

  devtool: argv.NODE_ENV === 'development' ? 'source-map' : false,

  plugins: [
    new CleanWebpackPlugin(),

    new MiniCssExtractPlugin({ filename: 'index.css' }),

    new OptimizeCSSAssetsPlugin({}),

    new HtmlWebpackPlugin({
      filename: path.join(__dirname, 'build/index.html'),
      template: path.join(__dirname, 'src/index.pug'),
      inject: false,
      minify: {
        removeAttributeQuotes: true,
      },
    }),

    new CopyPlugin([
      { from: 'src/models', to: 'models' },
      { from: 'src/textures', to: 'textures' },
    ]),
  ],

  devServer: {
    compress: true,
    historyApiFallback: true,
    contentBase: [ './src' ],
    host: '0.0.0.0',
    port: 8080,
  },
});
