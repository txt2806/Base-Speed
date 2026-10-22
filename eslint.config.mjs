import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      // @ts-expect-error -- flat-config typedef của plugin chưa khớp ESLint 9 ở kiểu
      import: (await import("eslint-plugin-import")).default,
    },
    rules: {
      // === CLEANCODE.md rule 4: import alias @/ — cấm relative vượt thư mục ===
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../..*"],
              message:
                "Dùng alias @/... thay cho relative path vượt thư mục (CLEANCODE.md rule 4).",
            },
          ],
        },
      ],

      // === CLEANCODE.md rule 6: cấm console trong code commit ===
      "no-console": ["error", { allow: ["warn", "error"] }],

      // === CLEANCODE.md: no circular dependencies ===
      "import/no-cycle": ["error", { maxDepth: "∞" }],
      "import/no-unused-modules": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // === CLEANCODE.md rule 5: cấm any ===
      "@typescript-eslint/no-explicit-any": "error",
      // Convention: tham số không dùng nhưng giữ signature API thì prefix `_`
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "TSAsExpression > TSTypeReference > Identifier[name='any']",
          message: "Ép kiểu any bị cấm — dùng unknown + type guard.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "**/*.d.ts",
    "**/public/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
