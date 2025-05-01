module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      rules: {
        'no-shadow': 'off',
        'no-undef': 'off',
        'no-console': 'error',
        '@typescript-eslint/no-shadow': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
  ],
};
