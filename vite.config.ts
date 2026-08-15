import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    nitro({
      preset: process.env["VERCEL"] ? "vercel" : "node-server",
      ...(process.env["VERCEL"] ? {} : { output: { dir: ".output" } }),
    }),
    react(),
  ],
  server: {
    port: 5173,
    host: "::",
  },
  preview: {
    port: 4173,
  },
});
