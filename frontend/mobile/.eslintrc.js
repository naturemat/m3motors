module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['*.js'],
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
