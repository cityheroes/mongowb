var path = require('path');
var webpack = require('webpack');

var serverConf = {
	mode: 'production',
	entry: './src/mongoWB',
	target: 'node',
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.js', '.ts']
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'mongoWB.node.js',
		libraryTarget: 'umd',
		library: 'mongoWB'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	},
	stats: {
		colors: true
	},
	devtool: 'source-map',
	externals: {
		'FormulaValues': 'formula-values'
	}
};

var webConf = {
	mode: 'production',
	entry: './src/mongoWB',
	target: 'web',
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.js', '.ts']
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'mongoWB.web.js',
		libraryTarget: 'umd',
		library: 'mongoWB',
		libraryExport: 'default'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader'
			}
		]
	},
	stats: {
		colors: true
	},
	devtool: 'source-map',
	externals: {
		'FormulaValues': 'formula-values'
	}
};

module.exports = [serverConf, webConf];
