const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // 사용하지 않는 변수 경고 (언더스코어 시작은 허용)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      // any 타입 사용 경고
      "@typescript-eslint/no-explicit-any": "warn",
      // 비동기 함수에서 await 없이 사용 금지
      "@typescript-eslint/require-await": "warn",
      // 함수 반환 타입 명시 (라우트 핸들러 제외)
      "@typescript-eslint/explicit-function-return-type": "off",
      // == 대신 === 강제
      eqeqeq: ["error", "always"],
      // console.log 경고 (console.error는 허용)
      "no-console": ["warn", { allow: ["error", "warn", "log"] }],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];