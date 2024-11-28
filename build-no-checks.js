import { build } from 'vite'

async function buildProject() {
  try {
    await build({
      configFile: './vite.config.ts',
      mode: 'production',
      build: {
        sourcemap: false,
        target: 'es2015',
        outDir: 'dist',
        emptyOutDir: true,
        minify: 'esbuild',
        cssMinify: true,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'react-router-dom'],
              mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            },
          },
        },
      },
    })
    console.log('Build completed successfully!')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildProject()
