import { defineConfig } from "vite";

export default defineConfig({
  // relative asset paths so the build works at any mount point
  base: "./",
  build: {
    target: "es2019",
  },
});
