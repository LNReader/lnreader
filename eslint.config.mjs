// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    extends: compat.extends(
      'plugin:react-hooks/recommended',
      'plugin:react-native/all',
      'plugin:@tanstack/query/recommended',
    ),

    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],

    rules: {
      '@typescript-eslint/no-shadow': ['warn'],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-shadow': 'off',
      'no-undef': 'off',
      'no-console': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/split-platform-components': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
