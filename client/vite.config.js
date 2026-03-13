import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/@react-pdf/renderer')) return 'pdf-renderer';
                    if (id.includes('node_modules/recharts')) return 'charts';
                    if (id.includes('node_modules/react-grid-layout')) return 'grid-layout';
                    if (id.includes('node_modules/@dnd-kit')) return 'dnd-kit';
                    if (id.includes('node_modules/framer-motion')) return 'motion';
                    if (id.includes('node_modules/socket.io-client')) return 'socket';
                    if (id.includes('node_modules/lucide-react')) return 'icons';
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            zlib: 'browserify-zlib',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
        css: false,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
