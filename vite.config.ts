import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version ?? "0.0.0"),
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
