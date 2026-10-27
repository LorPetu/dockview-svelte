import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Library and demo are runes-only; dependencies keep their own mode.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// The demo site is fully static; the library itself is built by svelte-package.
			adapter: adapter({ fallback: '404.html' })
		})
	],
	test: {
		include: ['src/test/**/*.test.ts'],
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts']
	},
	// Tests mount components, so resolve Svelte's client build.
	resolve: mode === 'test' ? { conditions: ['browser'] } : undefined
}));
