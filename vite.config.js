import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	plugins: [viteSingleFile()],
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
	test: {
		include: ['test/**/*.test.js'],
		environment: 'node',
		environmentMatchGlobs: [['test/ui/**', 'happy-dom']],
	},
});
