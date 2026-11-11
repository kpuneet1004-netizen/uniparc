# UNIPARC — Cinematic Interactive Experience

React + TypeScript + Vite foundation for the approved homepage.

## Direction
- Cinematic motion and maximum interaction
- Mobile experience parity, adapted for touch
- Strict black, white and neutral-grey identity
- Official UNIPARC logo

## Stack
React, TypeScript, Vite, GSAP + ScrollTrigger, Three.js, Lucide React, custom CSS.

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```
Vite output: `dist/`.

## Cloudflare Pages
Framework: Vite; build command: `npm run build`; output directory: `dist`; production branch: `main`.

## Pre-launch checklist
- Replace illustrative product photography with approved UNIPARC catalogue assets.
- Add verified product marketplace URLs; none are fabricated in this build.
- Confirm final product copy, FAQ, social links and legal policies.
- Connect CMS after schemas and content ownership are finalized.
- Test performance, accessibility and touch interactions across target devices.

This repository contains a frontend foundation; it is not deployed to Cloudflare yet.

## First-drop waitlist

The closing section includes an accessible email capture form. It is intentionally inactive until a real submission endpoint is configured; the frontend does not pretend to store sign-ups.

1. Configure `VITE_WAITLIST_ENDPOINT` in the local `.env` file and in the Cloudflare build environment.
2. Point it to a trusted HTTPS endpoint that accepts `POST application/json` with `{ "email": "person@example.com", "source": "uniparc-first-drop", "consent": true }`.
3. The endpoint must validate and normalize email addresses, store consent and timestamp, handle duplicate sign-ups idempotently, apply abuse/rate limiting, and return a 2xx response only after a successful save.
4. Before enabling public collection, publish and link an approved privacy notice explaining the data controller, purpose, retention, contact and deletion/withdrawal process. Ensure the endpoint supports unsubscribe/deletion requests.

The form displays a clear disabled state when the endpoint is not configured. Never use a placeholder endpoint in production.
