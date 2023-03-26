const path = require('path')

export default {
    base: '/monaco-editor-test/',
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
    },
}
