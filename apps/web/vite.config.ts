import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'effect-mermaid': path.resolve(__dirname, '../../packages/core/src'),
      'effect-mermaid-react': path.resolve(__dirname, '../../packages/react/src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    strictPort: true
  }
})
