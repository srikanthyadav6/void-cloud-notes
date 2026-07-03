import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const base = process.env.GITHUB_PAGES === "true" ? "/void-cloud-notes/" : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "RecallStack",
        short_name: "RecallStack",
        description: "Static personal interview-prep dashboard built around active recall.",
        theme_color: "#111827",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: base,
        icons: [
          {
            src: `${base}pwa-192.svg`,
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: `${base}pwa-512.svg`,
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"]
      }
    })
  ]
});
