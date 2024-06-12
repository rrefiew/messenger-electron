// webpack.config.js
const path = require("path");

module.exports = {
  // Your existing configuration...
  resolve: {
    fallback: {
      crypto: require.resolve("crypto-browserify"),
    },
  },
};
