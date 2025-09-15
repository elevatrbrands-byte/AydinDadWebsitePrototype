# Aydin's Dad — Smartphone Marketplace (GitHub Pages)

A static React app (single page with hash routing) you can host on GitHub Pages. Includes a phones catalog, product pages with **live financing calculator** (down payment + APR + term), and a **Sell/Trade‑in** form.

## Quick start (no build tools)
1. Create a new public repository on GitHub (e.g., `aydins-dad-marketplace`).
2. Upload **index.html** and **app.jsx** to the repository root.
3. In the repo: **Settings → Pages** → *Build and deployment* → **Deploy from a branch** → Branch: **main** (or `master`) → Folder: **/** (root). Save.
4. Your site will be served from the URL GitHub shows in the Pages panel (e.g., `https://<username>.github.io/aydins-dad-marketplace/`).

## Local preview
Just open `index.html` in a browser (it loads React, Tailwind, and Babel from CDNs).

## Notes
- The app uses **Babel Standalone** to transform JSX in the browser—great for demos and Pages. For production, consider a bundler (Vite/Next) and remove Babel Standalone.
- Financing math is a standard amortization example and for demonstration only.
