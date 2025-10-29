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
        setupMiddlewares: (middlewares, devServer) => {
            if (!devServer) {
                throw new Error('webpack-dev-server is not defined');
            }

            // json-prune-xhr-response 테스트를 위한 mock API 엔드포인트
            const xhrMockResponses = {
                '/api/data1': { ads1: 1, tracking1: { banner1: 'seoul', popup1: 'kr' } },
                '/api/data2': { ads2: 1, tracking2: { banner2: 'seoul', popup2: 'kr' }, content2: 'test' },
                '/api/data3': [
                    { ads3: 1, tracking3: 'seoul' },
                    { ads3: 2, tracking3: 'busan' }
                ],
                '/api/data4': {
                    tracking4: {
                        video4: { ads4: 1, content4: '집' },
                        display4: { ads4: 2, content4: '회사' }
                    }
                },
                '/api/data5': { ads5: 123, content5: 'test', tracking5: 'seoul' }
            };

            // json-prune-fetch-response 테스트를 위한 mock API 엔드포인트
            const fetchMockResponses = {
                '/api/fetch-data1': { ads1: 1, tracking1: { banner1: 'seoul', popup1: 'kr' } },
                '/api/fetch-data2': { ads2: 1, tracking2: { banner2: 'seoul', popup2: 'kr' }, content2: 'test' },
                '/api/fetch-data3': [
                    { ads3: 1, tracking3: 'seoul' },
                    { ads3: 2, tracking3: 'busan' }
                ],
                '/api/fetch-data4': {
                    tracking4: {
                        video4: { ads4: 1, content4: '집' },
                        display4: { ads4: 2, content4: '회사' }
                    }
                },
                '/api/fetch-data5': { ads5: 123, content5: 'test', tracking5: 'seoul' }
            };

            // 모든 /api/data* 경로에 대해 mock 응답 제공 (XHR용)
            // JSON 문자열로 응답하여 템퍼몽키의 JSON.parse()가 정상 작동하도록 함
            Object.keys(xhrMockResponses).forEach(path => {
                devServer.app.get(path, (req, res) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    // res.json() 대신 JSON 문자열로 직접 전송
                    res.send(JSON.stringify(xhrMockResponses[path]));
                });
            });

            // 모든 /api/fetch-data* 경로에 대해 mock 응답 제공 (Fetch용)
            Object.keys(fetchMockResponses).forEach(path => {
                devServer.app.get(path, (req, res) => {
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    // res.json() 대신 JSON 문자열로 직접 전송
                    res.send(JSON.stringify(fetchMockResponses[path]));
                });
            });

            return middlewares;
        },
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
            template: "./public/extend-css-test.html",
            filename: "extend-css-test.html",
            chunks: ["testPage"],
        }),
        new HtmlWebpackPlugin({
            template: "./public/scriptlet-test.html",
            filename: "scriptlet-test.html",
            chunks: ["testPage"],
        }),
        new MiniCssExtractPlugin(),
    ],
};
