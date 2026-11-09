# UNIPARC — Brand Universe

A responsive, culture-first brand presence experience for UNIPARC.

## Stack
- React 18 + TypeScript
- Vite 6
- GSAP + ScrollTrigger
- Lenis smooth scrolling
- Cloudflare Workers static assets

## Architecture
- `src/App.tsx`: application composition and motion lifecycle
- `src/components/site-sections.tsx`: reusable page sections and navigation
- `src/styles/tokens.css`: typography, palette, spacing and layering tokens
- `src/styles/global.css`: reset, shared primitives and accessibility
- `src/styles/sections.css`: responsive section layouts and interactions

## Design system
- Display: Plus Jakarta Sans
- Body: Inter
- Metadata: JetBrains Mono
- Palette: #080808, #141414, #FFFFFF, #F2F0EA, #C6FF00
- 8px spacing scale, 1200px content width, responsive 20/32px gutters
- Reduced-motion and keyboard focus support

## Local development
    npm install
    npm run dev

## Production build
    npm run build

Vite output: dist/.

## Cloudflare
The Worker static-assets configuration is in wrangler.jsonc. Build output is served from dist/.

## Integration notes
- The email signup UI is intentionally not connected to a provider yet. Connect a permission-based email service before enabling collection.
- Culture and community links currently point to UNIPARC's official Instagram.
- Editorial photography should be replaced with approved UNIPARC campaign and community assets before launch.
- Product listings, prices, stock and purchase actions are intentionally omitted until verified catalogue data and approved commerce links are available.
- Confirm legal policies and contact details before production launch.

## Quality gates
- Run npm run build
- Test 320px–1440px viewport widths
- Test keyboard navigation and focus states
- Test prefers-reduced-motion
- Verify all image assets, links, analytics and signup integration
