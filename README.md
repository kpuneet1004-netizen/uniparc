# UNIPARC — Static Editorial Experience

A clean, dependency-free HTML, CSS and JavaScript website deployed as Cloudflare Worker static assets.

## Architecture
- `site/index.html`: semantic document and page structure
- `site/styles.css`: responsive visual system and motion
- `site/app.js`: navigation, interactions and reveal behavior
- `site/intro.js`: standalone Canvas 2D cinematic intro
- `site/assets/`: retained original logo and campaign imagery
- `wrangler.jsonc`: Cloudflare static asset configuration

## Local preview
Serve the `site/` directory with any static HTTP server. No package installation or build step is required.

## Production
GitHub Actions deploys `site/` directly through Wrangler. Required repository secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
