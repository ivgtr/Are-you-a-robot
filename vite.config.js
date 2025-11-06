import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const isGitHubPages = process.env.BUILD_TARGET === 'gh-pages'

export default defineConfig({
  base: isGitHubPages ? '/Are-you-a-robot/' : '/',
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true
      }
    })
  ],
  build: isGitHubPages ? {
    // GitHub Pages build
    outDir: 'out',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  } : {
    // Library build
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
