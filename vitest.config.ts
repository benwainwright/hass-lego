import { defineConfig } from "vite";

import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    coverage: {
      all: true,
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/*d.ts",
        "src/tools/*",
        "src/test-support/*",
      ],
      provider: "v8",
      cleanOnRerun: true,
      reporter: ["text", "html", "lcov"],
    },
  },
});
