import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Для GitHub Pages: в CI задаётся VITE_BASE="/имя-репозитория/" */
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
});
