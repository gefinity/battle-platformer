const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: 'main',
    output: {
        path: 'build',
        filename: 'app-compiled.js',
    },
    devtool: 'eval-source-map',
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-strict-mode', 'transform-class-properties'],
                },
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
        ],
    },
    resolve: {
        modulesDirectories: ['src', 'node_modules'],
        alias: {
            engine: '../geTech1.compiled',

            // for dev: pointing outside the project, to the engine repro's dist folder
            //engine: '../../geTech1-js/dist/geTech1.js',
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.template.html',
        }),
        new CopyWebpackPlugin([
            {from: 'assets'},
        ]),
        new CleanWebpackPlugin(['build/*']),
    ],
    devServer: {
        contentBase: ['build', 'assets'],
    },
};