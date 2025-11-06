import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true
      }
    })
  ],
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'AreYouARobot',
      fileName: (format) => `are-you-a-robot.${format}.js`
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})
