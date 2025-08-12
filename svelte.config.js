import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		
		// Custom path aliases for our project structure
		alias: {
			$graphql: 'src/lib/graphql',
			$schema: 'src/lib/schema',
			$types: 'src/lib/types'
		}
	}
};

export default config;