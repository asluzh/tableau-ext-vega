import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import transformPlugin from 'vite-plugin-transform'
import packageJson from './package.json';
console.log('Building version', packageJson.version);

const replaceFiles = [
  './dist/tableau-ext-gh.trex',
  './dist/tableau-ext-lh.trex',
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    transformPlugin({
      tStart: '{%',
      tEnd:   '%}',
      exclude: ['node_modules'],
      replaceFiles,
      replace: {
        VERSION_NUMBER: packageJson.version,
        PACKAGE_NAME: packageJson.name,
        PACKAGE_DESCRIPTION: packageJson.description,
      },
    }),
  ],
  base: '/'+packageJson.name+'/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        configure: 'configure.html',
      },
      output: {
        manualChunks(id) {
          // if (id.includes('node_modules/d3-')) {
          //     return 'd3';
          // }
          // if (id.includes('node_modules/vega-embed')) {
          //     return 'vega-embed';
          // }
          // if (id.includes('node_modules/vega')) {
          //     return 'vega';
          // }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // assetFileNames: (assetInfo) => {
        //   if (assetInfo.name === 'style.css') return 'custom.css';
        //   return assetInfo.name;
        // },
      },
    }
  }
})
