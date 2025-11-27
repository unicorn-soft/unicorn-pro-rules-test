const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        main: './src/index.js',
        testPage: './src/test-page.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        client: {
            webSocketURL: 'ws://localhost:3000/ws',
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            filename: 'index.html',
            chunks: ['main'],
        }),
        new HtmlWebpackPlugin({
            template: './public/extend-css-test.html',
            filename: 'extend-css-test.html',
            chunks: ['testPage'],
        }),
        new HtmlWebpackPlugin({
            template: './public/scriptlet-test.html',
            filename: 'scriptlet-test.html',
            chunks: ['testPage'],
        }),
        new MiniCssExtractPlugin(),
    ],
};
