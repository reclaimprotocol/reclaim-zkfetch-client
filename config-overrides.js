const webpack = require("webpack");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function override(config) {
  // Add polyfills for Node.js core modules
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"), // Polyfill for URL
    vm: require.resolve("vm-browserify"),
    path: require.resolve("path-browserify"),
    zlib: require.resolve("browserify-zlib"),
    fs: false,
    net: false,
    tls: false,
    readline: false,
    child_process: false,
    constants: require.resolve("constants-browserify"),
    process: require.resolve("process/browser.js"),
    worker_threads: require.resolve("./worker-threads-polyfill.js"),
  });

  // Set up aliases
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'node:url': require.resolve('url/'),
    'koffi': false,
    'react-native-tcp-socket': false,
  };

  // Ensure fallback is applied
  config.resolve.fallback = fallback;

  // Add plugins
  config.plugins = (config.plugins || []).concat([
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^node:url$/
    }),
  ]);

  // Source map loader
  config.module.rules.push({
    test: /\.js$/,
    enforce: 'pre',
    use: ['source-map-loader'],
    exclude: /node_modules/,
  });

  return config;
};
