import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    historyApiFallback: true,
  },
  // For dev server, Vite handles SPA routing automatically
  // but you can also add this if needed:
  server: {
    historyApiFallback: true,
  }
});