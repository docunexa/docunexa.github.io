import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-pdf': ['pdf-lib', 'pdfjs-dist'],
          'vendor-docx': ['docx', 'mammoth'],
          'vendor-utils': ['jspdf', 'html2canvas', 'jszip', 'marked', 'dompurify']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist', 'pdf-lib', 'docx', 'mammoth', 'jspdf', 'html2canvas', 'jszip', 'marked', 'dompurify']
  }
});

