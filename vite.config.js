import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

import tailwindcss from '@tailwindcss/vite' // tailwindcss 插件
import autoImport from 'unplugin-auto-import/vite' // 自动引入
import compression from 'vite-plugin-compression' // 代码压缩
import imageTools from 'vite-plugin-image-tools' // 图片压缩
import svgr from 'vite-plugin-svgr' // svg

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    open: true,
    cors: true,
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
    }),
    tailwindcss(),
    imageTools({
      quality: 70,
      enableWebp: true,
    }),
    autoImport({
      imports: [{ 'src/service/api': [['default', 'Http']] }, { 'src/hooks': [['default', 'Hooks']] }],
    }),
    compression(),
  ],
})
