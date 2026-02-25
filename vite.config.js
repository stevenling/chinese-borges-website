import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

/** 构建结束后复制 index.html 为 404.html，供 GitHub Pages 等静态托管在任意路径 404 时回退到 SPA */
function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist')
      const indexPath = resolve(outDir, 'index.html')
      const destPath = resolve(outDir, '404.html')
      if (existsSync(indexPath)) {
        copyFileSync(indexPath, destPath)
      }
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_URL || '/',
  plugins: [vue(), copyIndexTo404()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
