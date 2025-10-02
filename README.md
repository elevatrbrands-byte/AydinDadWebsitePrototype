# TK Phones — Static Buyback Site (Supabase + GitHub Pages)

A lightweight, **original** static website for buying used phones from customers. Built with vanilla JS + Tailwind (CDN), wired to Supabase for auth and admin pricing.

> ⚠️ This project is an original design. It is **not** a pixel-for-pixel clone of any existing website.  
> It provides similar *functionality* (quote flow, FAQs, admin pricing) with TK Phones branding.

## Features
- Guided quote flow (brand → model → storage → carrier → condition questions → quality score 1–4)
- Auto price estimate from quality (Q1–Q4). Admin can edit the price table in real time.
- Supabase email/password auth for admins on `/admin.html`
- Fully static: perfect for GitHub Pages or any static host.
- Clean, modern UI using Tailwind CDN. Minimal JS; no build step.

## Quick Start
1. **Create a Supabase project** and open the SQL editor.
2. **Run the SQL** from `supabase/schema.sql` to create tables and Row Level Security (RLS) policies.
3. In **Authentication → Providers → Email**, enable email/password signups (or create users manually).
4. In **Authentication → Users**, ensure your admin email exists, and add it to the `admin_emails` table.
5. In `web/config.js`, set:
   - `SUPABASE_URL = "https://befuoraecgrrorlfgfhm.supabase.co"`
   - `SUPABASE_ANON_KEY = "<your anon key>` (provided by you)
6. Serve the site locally or push to **GitHub Pages**.
   - GitHub Pages: commit everything in this folder to a repo → Settings → Pages → deploy from `main` → root.

## Local Preview
Just open `index.html` in a local server:
```bash
# Python 3
python -m http.server 8080
# then visit http://localhost:8080
```

## Files
- `index.html` — main SPA with quote flow and public pages
- `admin.html` — admin dashboard with login and price editor
- `web/app.js` — quote flow logic and Supabase reads
- `web/admin.js` — admin auth + price CRUD
- `web/supabaseClient.js` — creates Supabase client from config
- `web/config.js` — injects your Supabase URL and anon key
- `styles.css` — extra styles (optional)
- `supabase/schema.sql` — all tables + policies

## Security Notes
- Only **authenticated** users whose email appears in `admin_emails` can **insert/update** prices.
- Public (anon) can **read** price tables to compute quotes.
- Never publish your **service role** key. The site uses only the **anon** key.
- Consider enabling email domain restrictions or magic links for admins.

## Pricing Logic
1. User answers condition questions → a numeric score → quality bucket **Q1–Q4**.
2. `buyback_prices` stores one row per model with columns `q1_price..q4_price` (editable in admin).
3. The quote uses the bucketed price. You can later add multipliers per storage or carrier if desired.

## License
You can use and modify this template for your business. Please keep your branding and do not claim it's a clone of any specific site.
