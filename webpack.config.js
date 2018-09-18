var path = require('path');
var webpack = require('webpack');

var common = {
	mode: 'production',
	entry: './src/mongoWB',
	resolve: {
		extensions: ['.webpack.js', '.web.js', '.js', '.ts']
	},
	stats: {
		colors: true
	},
	devtool: 'source-map',
	externals: {
		'FormulaValues': 'formula-values'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					configFile: 'webpack.tsconfig.json'
				}
			}
		]
	}
};

var serverConf = Object.assign(common, {
	target: 'node',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'mongoWB.js',
		libraryTarget: 'umd',
		library: 'mongoWB'
	}
});

var webConf = Object.assign(common, {
	target: 'web',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'mongoWB.web.js',
		libraryTarget: 'umd',
		library: 'mongoWB',
		libraryExport: 'default'
	}
});

module.exports = [serverConf, webConf];
