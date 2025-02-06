import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/jikanwari-app/",
  plugins: [react()],
  define: {
    "import.meta.env.APP_TITLE": '"時間割表アプリ"',
  },
});
