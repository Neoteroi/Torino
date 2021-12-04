// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  settings: {
    react: {
      // Regex for Component Factory to use,
      // default to "createReactClass"
      createClass: "createReactClass",

      // Pragma to use, default to "React"
      pragma: "React",
      version: "detect",
      // React version. "detect" automatically picks the version you
      // have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the
      // detected value.
      // default to latest and warns if missing
      // It will default to "detect" in the future
      flowVersion: "0.53", // Flow version
    },
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "jsdoc"],
  rules: {
    indent: ["error", 2, {SwitchCase: 1}],
    "linebreak-style": ["off", "unix"],
    quotes: ["warn", "double"],
    semi: ["warn", "always"],
    "no-trailing-spaces": ["error"],
    "spaced-comment": ["error", "always"],
    "max-len": [
      2,
      80,
      4,
      {
        ignorePattern: "^import\\s.+\\sfrom\\s.+;$",
        ignoreUrls: true,
      },
    ],
    "key-spacing": ["error", {beforeColon: false}],
    "@typescript-eslint/no-inferrable-types": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "new-parens": ["warn"],
    "no-multiple-empty-lines": ["warn"],
    "no-console": ["warn"],
    "space-before-function-paren": [
      "off",
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "react/display-name": ["off"],

    "jsdoc/check-alignment": 1,
    "jsdoc/check-examples": 0,
    "jsdoc/check-indentation": 1,
    "jsdoc/check-param-names": 1,
    "jsdoc/check-syntax": 1,
    "jsdoc/check-tag-names": 1,
    "jsdoc/check-types": 1,
    "jsdoc/implements-on-classes": 1,
    "jsdoc/match-description": 0,
    "jsdoc/newline-after-description": 1,
    "jsdoc/no-types": 1,
    "jsdoc/no-undefined-types": 1,
    "jsdoc/require-description": 1,
    "jsdoc/require-description-complete-sentence": 0,
    "jsdoc/require-example": 0,
    "jsdoc/require-hyphen-before-param-description": 1,
    "jsdoc/require-jsdoc": 0,
    "jsdoc/require-param": 0,
    "jsdoc/require-param-description": 0,
    "jsdoc/require-param-name": 1,
    "jsdoc/require-param-type": 1,
    "jsdoc/require-returns": 0,
    "jsdoc/require-returns-check": 1,
    "jsdoc/require-returns-description": 1,
    "jsdoc/require-returns-type": 1,
    "jsdoc/valid-types": 1,
  },
};
