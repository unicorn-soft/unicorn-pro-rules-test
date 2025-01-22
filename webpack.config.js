const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: "./src/index.js",
        testPage: "./src/test-page.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[contenthash].js",
        clean: true,
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        port: 3000,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html",
            chunks: ["main"],
        }),
        new HtmlWebpackPlugin({
            template: "./public/test-page.html",
            filename: "test-page.html",
            chunks: ["testPage"],
        }),
        new MiniCssExtractPlugin(),
    ],
};
