import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // SPA mode: every route is served by the same index.html fallback and
    // talks to the ElysiaJS backend over the REST API.
    adapter: adapter({
      fallback: 'index.html',
    }),
  },
};

export default config;
