import honox from "honox/vite";
import client from "honox/vite/client";
import { defineConfig } from "vite";
import build from "@hono/vite-build/cloudflare-pages";
import adapter from "@hono/vite-dev-server/cloudflare";

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      plugins: [client()],
      resolve: {
        alias: {
          "@": "/app",
        },
      },
      build: {
        rollupOptions: {
          input: ["/app/client.ts", "/app/style.css"],
        },
      },
    };
  }

  return {
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
  };
});
