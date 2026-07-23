const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// SVG transformer: imports of .svg files become React Native SVG components
const { transformer, resolver } = config;
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  extraNodeModules: {
    ...resolver.extraNodeModules,
    'react-native-mmkv': path.resolve(__dirname, 'src/services/offline/mmkv-mock.js'),
  },
};

module.exports = config;
