module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'jest.config.js', 'tests/**'],
  rules: {
    '@typescript-eslint/member-ordering': ['error'],

    indent: 'off',
    quotes: ['error', 'single', { avoidEscape: true }],
    'linebreak-style': ['error', 'unix'],

    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': [
      'off',
      { allowTypedFunctionExpressions: true },
    ],
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-redeclare': ['error', { ignoreDeclarationMerge: true }],

    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'explicit',
        overrides: {
          accessors: 'no-public',
          constructors: 'no-public',
        },
      },
    ],

    'no-console': ['warn'],
    'eol-last': ['error', 'always'],
    complexity: ['error', 13],
    'max-depth': ['error', 4],
    'max-lines': [
      'error',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-lines-per-function': [
      'error',
      {
        max: 150,
        skipBlankLines: true,
        skipComments: true,
        IIFEs: true,
      },
    ],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 5],
    'max-statements': ['error', 22],
    'max-statements-per-line': 2,

    'func-style': ['error', 'expression'],

    '@typescript-eslint/unbound-method': ['off'],

    '@typescript-eslint/no-unsafe-assignment': ['off'],

    '@typescript-eslint/no-unsafe-member-access': ['off'],

    '@typescript-eslint/no-unsafe-return': ['off'],

    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: false,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.{spec,test}.{ts,js}'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
  ],
};
