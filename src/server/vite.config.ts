import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'index.ts',
    outDir: '../../dist/server',
    emptyOutDir: true, // Fix: Enable emptying outDir even when outside project root
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      external: [...builtinModules],
      // Fix: Suppress eval warnings from protobufjs
      onwarn(warning, warn) {
        // Ignore eval warnings from protobufjs/inquire
        if (warning.code === 'EVAL' && warning.id?.includes('@protobufjs/inquire')) {
          return;
        }
        warn(warning);
      },
      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
        inlineDynamicImports: true,
      },
    },
  },
});
