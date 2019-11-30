const path = require('path');
const Webpack = require('webpack');
module.exports = {
    entry: './src/js/chat.js',
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: './public/js/main.js',
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            }
        ],
    },

    watch: false,
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/
    }
};