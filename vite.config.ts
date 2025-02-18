import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/jikanwari-app/",
  plugins: [react()],
  define: {
    "import.meta.env.APP_TITLE": '"時間割表アプリ"',
    // 環境変数を明示的に含める
    "process.env": process.env,
  },
});
