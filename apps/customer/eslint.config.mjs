// Minimal flat config — avoids @eslint/eslintrc dependency in isolated pnpm workspace
// Next.js lint is run via `next lint` which already applies core-web-vitals rules.
// This file satisfies the new ESLint flat config requirement without extra deps.
export default [
  {
    ignores: ["node_modules/**", ".next/**", "dist/**"],
  },
];
