# UNIPARC — Cinematic Interactive Experience

React + TypeScript + Vite frontend for the UNIPARC brand experience.

## Stack
React, TypeScript, Vite, GSAP, Three.js, Lucide React and custom CSS.

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```
Vite output directory: `dist/`.

## Deploy with Cloudflare Pages
This repository is configured for Cloudflare Pages' native Git integration. No Cloudflare Worker, Wrangler deployment workflow, or GitHub API-token secrets are required.

In Cloudflare:
1. Open **Workers & Pages → Create application → Pages → Connect to Git**.
2. Select this repository: `kpuneet1004-netizen/uniparc`.
3. Set the production branch to `main`.
4. Use build command `npm run build`.
5. Set build output directory to `dist`.
6. Leave the root directory as `/` and deploy.
7. In the Pages project, open **Custom domains** and add `www.uniparc.in`. Follow the DNS instructions Cloudflare provides.
8. Verify the new Pages deployment and custom domain before changing or removing the existing Workers route/domain.

Cloudflare Pages will build and deploy automatically on pushes to `main`. Preview deployments are created for other branches.

## Pre-launch checklist
- Replace illustrative product photography with approved UNIPARC catalogue assets.
- Add verified product marketplace URLs; none are fabricated in this build.
- Confirm final product copy, FAQ, social links and legal policies.
- Connect CMS after schemas and content ownership are finalized.
- Test performance, accessibility and touch interactions across target devices.
