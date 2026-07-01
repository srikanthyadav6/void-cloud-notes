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
        name: "Void Cloud Notes",
        short_name: "Void Notes",
        description: "Local-first notes, folders, tags, and interview prep on Void Cloud.",
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
