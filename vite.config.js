const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig({
    // base: '/monaco-editor-test/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                preview: path.resolve(__dirname, 'pages/preview/preview.html'),
            },
        },
    },
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
});
