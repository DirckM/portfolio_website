/**
 * Flat config, loaded directly rather than through the eslintrc compat layer.
 *
 * It used to go through FlatCompat.extends('next/core-web-vitals', ...), which
 * crashed the whole run with `TypeError: Converting circular structure to JSON`
 * inside @eslint/eslintrc's config validator. eslint-config-next 16 ships real
 * flat configs at ./core-web-vitals and ./typescript, so the compat layer was
 * both the cause of the crash and unnecessary: it was converting a flat config
 * back into eslintrc shape so it could convert it forward again.
 *
 * The cost of that crash was not a broken command, it was two years of `npm run
 * lint` exiting non-zero for a reason nobody read, which is indistinguishable
 * from a lint suite with no findings.
 */

import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-plugin-prettier';

const eslintConfig = [
  // Ignores must come first and live in their own object, or ESLint applies
  // the rules below to node_modules before it gets here.
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',

      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',

      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
];

export default eslintConfig;
