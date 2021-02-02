const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({

	entry: './src/index.js',

	target: 'web',

	resolve: {

		extensions: [ '.js', '.css', '.scss' ],
	},

	output: {

		path: path.join(__dirname, 'build'),
		// filename: 'index.js',
	},

	module: {

		rules: [

			{
				test: /\.js$/,
				enforce: 'pre',
				use: [ { loader: 'source-map-loader' } ],
			},

			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [

					{ loader: 'babel-loader' },
					// linting with webapp eslint config
					// { loader: 'eslint-loader' },
				],
			},

			{
				test: /\.cpp$/,
				use: [

					{

						loader: '../xgk-cpp-webpack-loader/build/index.js',

						options: {

							execute: 'make -f /home/denis/reps/denis-belov/wasm-test/src/cpp/makefile',
							target: '/home/denis/reps/denis-belov/wasm-test/src/cpp/build/js/main.js',
							// total_rebuild: [

							//   '/home/denis/reps/denis-belov/xgk-math/makefiles/emcc/makefile':
							// ],
							watch_file: [

								'/home/denis/reps/denis-belov/xgk-math/makefiles/emcc/makefile',
								'/home/denis/reps/denis-belov/wasm-test/src/cpp/makefile',
							],
							watch_dir: [

								'/home/denis/reps/denis-belov/xgk-math/src',
								'/home/denis/reps/denis-belov/wasm-test/src/cpp/src',
							],
							// entry: '/home/denis/reps/denis-belov/wasm-test/src/cpp/src/main.cpp',
						},
					},
				],
			},

			{
				test: /\.(css|scss)$/,
				use: [

					{ loader: MiniCssExtractPlugin.loader },
					// to insert css into html
					// { loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'postcss-loader' },
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
			inject: 'body',
			minify: {

				removeAttributeQuotes: true,
			},
		}),

		new CopyPlugin({

			patterns: [

				// { from: 'src/models', to: 'models' },
				{ from: 'src/textures', to: 'textures' },
			],
		}),
	],

	devServer: {

		compress: true,
		historyApiFallback: true,
		host: 'localhost',
		port: 8080,
		open: true,
	},
});
