import honox from "honox/vite";
import { defineConfig } from "vite";
import build from "@hono/vite-build/cloudflare-workers";
import adapter from "@hono/vite-dev-server/cloudflare";

export default defineConfig({
  plugins: [
    honox({
      client: {
        input: ["/app/client.ts", "/app/style.css"],
      },
      devServer: {
        adapter,
      },
    }),
    build(),
  ],
  resolve: {
    alias: {
      "@": "/app",
    },
  },
  ssr: {
    external: ["@notionhq/client"],
  },
});
