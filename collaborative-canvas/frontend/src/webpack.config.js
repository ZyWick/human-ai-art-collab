const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  resolve: {
    fallback: {
      "https": require.resolve("https-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/")
    }
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"]
    })
  ]
};
