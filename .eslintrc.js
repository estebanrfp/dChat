module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    // 'prefer-const': ['error'],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'always'],
    // 'space-before-function-paren': [2, 'always']
    'arrow-parens': ['error', 'as-needed'],
    'no-return-assign': ['error', 'always'],
    // 'no-underscore-dangle': 0,
    // 'no-use-before-define': 'error',
    'no-use-before-define': ['error', { functions: true, classes: true }]
    // 'vars-on-top': 'error'
    // 'no-cond-assign': ['error', 'always']
  }
}
