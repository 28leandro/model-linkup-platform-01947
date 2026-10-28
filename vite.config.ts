import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: null,
      devOptions: { enabled: false },
      // Preserve the existing manifest URL, identity, icons, and standalone mode.
      manifest: false,
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // HTML must come from the network first, never from a precached shell.
        globPatterns: ['assets/**/*.{js,css,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: ({ request, url, sameOrigin }) => request.mode === 'navigate' &&
              sameOrigin && !/^\/\~oauth(?:\/|$)/.test(url.pathname) &&
              !/^\/(?:reset-password|forgot-password|auth)(?:\/|$)/.test(url.pathname) &&
              !url.searchParams.has('code') && !url.searchParams.has('token_hash'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nemu-navigations',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 30, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin &&
              /\/assets\/[^/]+-[a-zA-Z0-9_-]{8,}\.(?:js|css|woff2?)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'nemu-assets',
              expiration: { maxEntries: 150, maxAgeSeconds: 31536000 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    // Keep CSS syntax compatible with Safari iOS 14+.
    cssTarget: "safari14",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing deps into their own cacheable chunks so
        // the home page no longer pays the parse cost of the map/chart libs.
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "supabase": ["@supabase/supabase-js"],
          "query": ["@tanstack/react-query"],
          "leaflet": ["leaflet"],
          "charts": ["recharts"],
          "radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dropdown-menu",
          ],
          "icons": ["lucide-react"],
        },
      },
    },
  },
}));
