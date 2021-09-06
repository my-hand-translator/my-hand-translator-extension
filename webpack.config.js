const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  resolve: {
    extensions: [".js", ".jsx", ".json", ".wasm"],
  },
  entry: {
    popup: path.resolve(__dirname, "./src/index-popup.jsx"),
    options: path.resolve(__dirname, "./src/index-options.jsx"),
    mouseDrag: path.resolve(__dirname, "./src/index-mouseDrag.jsx"),
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.html$/,
        use: { loader: "html-loader" },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "popup.html",
      template: "./public/popup.html",
      chunks: ["popup"],
    }),
    new HtmlWebpackPlugin({
      filename: "options.html",
      template: "./public/options.html",
      chunks: ["options"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "./manifest.json", to: "[name][ext]" },
        { from: "./src/background.js", to: "[name][ext]" },
        { from: "./public/images/*.png", to: "images/[name][ext]" },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
};
