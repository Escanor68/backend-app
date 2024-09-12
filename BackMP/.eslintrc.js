module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        'no-console': 1,
        'no-unused-vars': [
            'warn',
            {
                vars: 'all',
                args: 'none',
                ignoreRestSiblings: false,
            },
        ],
        'no-var': ['error'],
        'prefer-const': [
            'error',
            {
                destructuring: 'all',
                ignoreReadBeforeAssign: false,
            },
        ],
        'object-shorthand': ['error', 'always'],
        'no-shadow': [
            'error',
            { builtinGlobals: false, hoist: 'functions', allow: [] },
        ],
    },
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
};
