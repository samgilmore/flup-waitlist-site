import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

function resolveBase() {
  if (process.env.VITE_SITE_BASE) {
    return process.env.VITE_SITE_BASE;
  }

  if (process.env.GITHUB_ACTIONS === "true") {
    const repository = process.env.GITHUB_REPOSITORY?.split("/")[1];

    if (repository) {
      return `/${repository}/`;
    }
  }

  return "/";
}

export function resolveBuildInputs() {
  return {
    main: fileURLToPath(new URL("./index.html", import.meta.url)),
    admin: fileURLToPath(new URL("./admin/index.html", import.meta.url))
  };
}

export default defineConfig({
  base: resolveBase(),
  build: {
    rollupOptions: {
      input: resolveBuildInputs()
    }
  },
  server: {
    host: "127.0.0.1",
    port: 4173
  }
});
