const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'b24.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'b24js',
        libraryTarget: 'umd'
    },

    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    node: {
        'fs': 'empty',
        'path': 'empty'
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                exclude: /b24js-cmodule/
            })
        ]
    },

    module: {
        noParse: /b24js-cmodule/,
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node-modules/
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                use: 'source-map-loader'
            },
            {
                test: /b24js-cmodule\.wasm$/,
                type: 'javascript/auto',
                loader: 'file-loader',
                options: {
                    name: 'b24js-cmodule.wasm'
                }
            }
        ]
    }
};