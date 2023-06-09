const path = require("path");
const dotenv = require("dotenv");
const webpack = require("webpack");

const env = dotenv.config().parsed;

module.exports = {
    entry: {
        content: "./src/content/index.tsx",
        popup: "./src/popup/index.tsx",
        service_worker: "./src/service_worker/service_worker.tsx",
        list: "./src/list/index.tsx",
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false},
                        }
                    },
                ],
                exclude: /nodde_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "..", "extension"),
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(env)
        })
    ]
};
