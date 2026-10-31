import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // The site's public address (see src/config/site.ts). index.html uses it as %SITE_URL%.
  const siteUrl = (loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL || "https://coupo-e03c4.web.app").replace(/\/+$/, "");

  return {
    plugins: [
      react(),
      {
        name: "site-url",
        // "pre": before Vite reads the links in the page, which would choke on "%SI".
        transformIndexHtml: { order: "pre", handler: (html: string) => html.replace(/%SITE_URL%/g, siteUrl) },
      },
    ],
    build: {
      rollupOptions: {
        output: {
          // Libraries change less often than the app, so they get their own files that browsers keep
          // cached across deploys.
          manualChunks: (id: string) => {
            if (!id.includes("node_modules")) return undefined;
            if (id.includes("/firebase/") || id.includes("/@firebase/")) return "firebase";
            if (id.includes("/motion/") || id.includes("/framer-motion/") || id.includes("/motion-dom/") || id.includes("/motion-utils/")) return "motion";
            if (/\/node_modules\/(react|react-dom|react-router|react-router-dom|@remix-run\/router|scheduler)\//.test(id)) return "react";
            return "vendor";
          },
        },
      },
    },
  };
});
