module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint','react','react-hooks','import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    'import/order': ['error', { 'newlines-between':'always','alphabetize':{order:'asc'} }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/prop-types': 'off'
  }
}

