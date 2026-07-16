const {getDefaultConfig} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Transpile @clerk/clerk-js to remove private class fields (#)
// that Hermes in Expo SDK 54 doesn't support
config.resolver.blacklistRE = undefined;
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-preset');

module.exports = config;
