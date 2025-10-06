# TK Phones

A static buyback website that replicates the UX of premium trade-in portals while using Supabase for authentication, pricing management, and quote storage.

## Features

- Beautiful multi-page marketing site with hero, testimonials, FAQs, and modal dialogs.
- Guided device assessment form that asks about screen, battery, water damage, carrier lock, and storage.
- Integrity scoring algorithm (1–4) that maps to admin-defined buyback pricing.
- Admin dashboard gated by Supabase Auth for managing phone models and editing pricing tiers.
- Quotes persisted to Supabase for follow-up workflows.

## Local development

This project is static and can be opened directly in a browser or served via any HTTP server:

```bash
python -m http.server 8000
```

## Supabase setup

1. Create a new Supabase project or use the provided instance.
2. Run the SQL in [`schema.sql`](schema.sql) in the SQL editor to create tables, policies, and helper functions.
3. In the project settings, copy the project URL and anon key into `app.js` if they differ from the provided defaults.
4. Enable email/password authentication in Supabase Auth.
5. Insert the UUID of any admin users into the `admin_users` table to grant dashboard access.

## Deployment

Push the repository to GitHub. The project is static, so GitHub Pages or any static host can serve the contents of the repository root.
