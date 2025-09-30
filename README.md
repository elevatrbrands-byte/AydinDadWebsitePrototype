# TK Phones

A React + Vite SPA for buying used phones from customers.

Features:
- Customer quote flow with integrity score (1–4) and instant estimate
- Admin auth (Supabase email/password & magic link)
- Admin can edit quality multipliers and model catalog
- Supabase SQL + policies included

## Setup
1. `npm i`
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. `npm run dev`

## Deploy
- Set the env vars in your host (Vercel/Netlify).
