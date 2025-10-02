# TK Phones — React (No-Build) SPA with Supabase

This project mirrors the **look & feel** and logic of the React snippet you shared, but it runs **without any build step** (works on GitHub Pages or any static host).

- React + ReactDOM via CDN (UMD)
- Supabase JS v2 via CDN (global `supabase`)
- Tailwind via CDN (for styling)
- Single `index.html` contains the app (as a Babel script) for easy hosting
- Admin route (`/admin`) to edit models & quality multipliers
- Matching **Supabase schema** in `supabase/schema.sql`

## How to use
1. Open **Supabase → SQL** and run `supabase/schema.sql` from this repo.
2. In **Auth → Providers**, enable **Email** (and optionally magic links). Add at least one user.
3. Deploy this folder to **GitHub Pages** (or open locally with a simple HTTP server).
4. Visit the site:
   - **Home** (`/`)
   - **Sell** (`/sell`): run the intake flow and get an instant estimate.
   - **How it works** (`/how`), **FAQs** (`/faqs`)
   - **Admin** (`/admin`): sign in and edit multipliers/models.

## Configuration
Supabase credentials are set at the top of the inline script in `index.html`:
```js
const SUPABASE_URL = "https://befuoraecgrrorlfgfhm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnVvcmFlY2dycm9ybGZnZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODkwNjYsImV4cCI6MjA3NDI2NTA2Nn0.2iKmQhtTiS9DAniPE9mBy0100HzMtIkc49HBpaZow4s";
```

## Notes
- The **intake flow, integrity scoring (1–4)**, and **estimate** logic match the snippet.
- **Admin dashboard** edits multipliers and models live (with RLS policies to restrict writes).
- No build tools needed; everything is static, ideal for GitHub Pages.
