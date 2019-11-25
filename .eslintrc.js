module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [ 
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  // add your custom rules here
  rules: {
    "no-console": process.env.NODE_ENV === 'production' ? 'off' : 'warn',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
