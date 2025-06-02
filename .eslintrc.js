module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/essential"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "vue"
  ],
  "rules": {
    //"no-empty-pattern": ["error", { "allowObjectPatternsAsParameters": true }],
    "no-empty-pattern": "warn",
    "no-useless-catch": "warn",
    "no-empty": "warn",
  }
};

