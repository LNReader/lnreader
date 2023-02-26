module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'prettier/prettier': ['error', { 'endOfLine': 'auto' }],
        '@typescript-eslint/no-shadow': ['warn'],
        'no-shadow': 'off',
        'no-undef': 'off',
        'react-native/no-inline-styles': 'warn',
        'no-console': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
