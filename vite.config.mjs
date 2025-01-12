import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Create different configs based on command (build vs serve)
export default defineConfig(({ command, mode }) => {
  if (mode === 'development') {
    return {
      build: {
      lib: {
        entry: resolve(__dirname, 'src/assembly.js'),
        name: 'oid-graph',
        fileName: () => 'oid-graph-dev.js', // function avoids .es
        formats: ['es']  // ES module format
      },
      minify: false,
      sourcemap: true,
      outDir: 'lib/graph',
      emptyOutDir: false, // avoid cleaning the output directory
      rollupOptions: {
        external: (id) => id.includes('oidlib-dev.js'),
        output: {
          globals: {
            '/lib/foundation/oidlib-dev.js': 'oidlib'
          }
        }
      }
      }
    }
  }
  // Production config (UMD build)
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/assembly.js'),
        name: 'oid-graph',
        fileName: () => 'oid-graph.js', // function avoids .umd
        formats: ['umd']
      },
      minify: true,
      outDir: 'lib/graph',
      emptyOutDir: false,
      rollupOptions: {
        external: (id) => id.includes('oidlib-dev.js'),
        output: {
          globals: {
            '/lib/foundation/oidlib-dev.js': 'oidlib'
          }
        }
      }
    }
  }
})
