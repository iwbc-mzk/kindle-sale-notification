const path = require("path");

module.exports = {
    entry: {
        content: "./src/index.tsx",
        popup: "./src/popup_index.tsx",
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
};
