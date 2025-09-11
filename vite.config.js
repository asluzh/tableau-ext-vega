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
      }
    }
  }
})
