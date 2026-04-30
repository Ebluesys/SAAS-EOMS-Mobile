const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  minifierConfig: {
      sourceMap: true,
    },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
   
  },
  resolver: {
    assetExts: [
      ...defaultConfig.resolver.assetExts, // Keep default extensions
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
      'svg',
      'json',
      'ttf',
      'otf',
    ],
    sourceExts: [
      ...defaultConfig.resolver.sourceExts, // Keep default extensions
      'mjs',
      'cjs',
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);