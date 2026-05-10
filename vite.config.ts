import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  preview: {
    allowedHosts: ["pm.eldoreth.com"],
    host: "0.0.0.0",
    port: 4000,
  },
  server: {
    allowedHosts: ["pm.eldoreth.com"],
  },
});
