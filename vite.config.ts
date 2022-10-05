// [React 製アプリケーションのビルドシステムを webpack から Vite に移行して爆速な開発体験を手に入れよう – PSYENCE:MEDIA](https://tech.recruit-mp.co.jp/front-end/post-21250/)
// [ViteプロジェクトをGithubPagesにあげる方法の備忘録](https://hasethblog.com/it/programming/vue/6271/)
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRefresh()],
  base:'./',
  build: {
    assetsDir:'./',
    outDir: "docs"
  },
});