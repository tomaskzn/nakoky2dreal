import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://nakocky.sk',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
});
