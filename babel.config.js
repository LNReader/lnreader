module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@components': './src/components',
            '@database': './src/database',
            '@hooks': './src/hooks',
            '@screens': './src/screens',
            '@strings': './strings',
            '@redux': './src/redux',
            '@services': './src/services',
            '@sources': './src/sources',
            '@utils': './src/utils',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};
