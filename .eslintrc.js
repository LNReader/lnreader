module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'no-shadow': 'off',
        'no-undef': 'error',
        'no-console': 'error',
      },
    },
  ],
};
