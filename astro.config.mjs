import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import node from "@astrojs/node";

const nodeAdapter = node({
  mode: "standalone",
});

const vercelAdapter = vercel({
  // webAnalytics: { enabled: true },
  // edgeMiddleware: false,
  // functionPerRoute: false,
});

const adapter =
  process.env.PUBLIC_ENV === "production" ? vercelAdapter : nodeAdapter;

export default defineConfig({
  integrations: [tailwind({}), react()],
  output: "server",
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
  adapter: adapter,
  functions: {
    "src/pages/**/*.astro": {
      memory: 1024,
    },
  },
});
