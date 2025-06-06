const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = [
    {
        ignores: ['dist/**/*'],
    },
    ...tseslint.config(
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
        {
            languageOptions: {
                parser: tseslint.parser,
                parserOptions: {
                    ecmaVersion: 'latest',
                    sourceType: 'module',
                },
                globals: {
                    // Node globals
                    process: 'readonly',
                    __dirname: 'readonly',
                    module: 'writable',
                    require: 'readonly',
                    // Jest globals
                    describe: 'readonly',
                    it: 'readonly',
                    expect: 'readonly',
                    beforeEach: 'readonly',
                    afterEach: 'readonly',
                    jest: 'readonly',
                },
            },
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'error',
                    { argsIgnorePattern: '^_' },
                ],
            },
        },
    ),
];
