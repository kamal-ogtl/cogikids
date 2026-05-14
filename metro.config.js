const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Replace react-native-mmkv with a pure JS mock so Expo Go can bundle without
// crashing on NativeWorklets / react-native-nitro-modules at module load time.
// The real MMKV (and its native deps) will be used in proper dev/prod builds.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-mmkv': path.resolve(__dirname, 'src/services/offline/mmkv-mock.js'),
};

module.exports = config;
