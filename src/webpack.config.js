const { resolve } = require('path');

module.exports = {
	entry: './js/canvasot.js',
	output: {
		filename: 'canvasot.min.js',
		path: resolve(__dirname, './dist'),
		libraryExport: 'default',
		library: 'Canvasot',
		libraryTarget: 'umd',
	},
	module: {
		rules: [
			{
				test: /\.js$/i,
				exclude: /node_modules/i,
				loader: 'babel-loader',
				options: {
					// 预设：指示babel做怎么样的兼容性处理
					presets: [
						[
							'@babel/preset-env',
							{
								// 按需加载
								useBuiltIns: 'usage',
								// 指定core-js版本
								corejs: {
									version: 3,
								},
								// 指定兼容性做到哪个版本浏览器
								targets: {
									chrome: '60',
									firefox: '60',
									ie: '9',
									safari: '10',
									edge: '17',
								},
							},
						],
					],
				},
			},
		],
	},
	externals: {
		// 拒绝JQuery被打包进来
		html2canvas: 'html2canvas',
	},
	mode: 'production',
};
