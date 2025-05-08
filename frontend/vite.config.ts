import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'hoist-non-react-statics': 'hoist-non-react-statics/dist/hoist-non-react-statics.js'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      'hoist-non-react-statics',
      '@emotion/react/jsx-runtime'
    ],
    esbuildOptions: {
      target: 'es2020',
    }
  },
  build: {
    commonjsOptions: {
      include: [/hoist-non-react-statics/],
      transformMixedEsModules: true
    }
  }
});









