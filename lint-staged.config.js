/**
 * @type {import('lint-staged').Configuration}
 */
export default {
  "*.{ts,tsx}": ["eslint", "tsc-files", "vitest related", "prettier --write"],
  "*.{js, cjs}": ["eslint", "tsc-files", "prettier --write"],
};
