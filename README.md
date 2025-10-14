# TK Phones Concierge Trade-In Site

A static, multi-page website for TK Phones, providing concierge smartphone buyback services with Supabase-backed quoting and admin pricing controls. The experience mirrors the flow of ricksistock.com with updated branding and an Integrity Index scoring system.

## Project structure

```
.
├── admin.html         # Admin login + pricing dashboard
├── assets/
│   └── logo.svg
├── index.html         # Marketing landing page
├── js/
│   ├── admin.js       # Supabase auth + pricing CRUD
│   ├── main.js        # Shared UI scripts
│   ├── sell.js        # Integrity Index quiz + pricing engine
│   └── supabaseClient.js # Supabase client bootstrap
├── sell.html          # Guided Integrity Index questionnaire
├── styles.css         # Global styling
└── supabase_schema.sql # Database tables, policies, and seed data
```

## Getting started locally

1. Clone this repository and open the project in your editor of choice.
2. Serve the static files using any local HTTP server (for example `npx serve .` or VS Code Live Server). All pages assume they are served from the project root so relative asset links resolve correctly.
3. Create a `.env.local.js` (optional) to override Supabase credentials:

```html
<script>
  window.__env = {
    SUPABASE_URL: 'https://befuoraecgrrorlfgfhm.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnVvcmFlY2dycm9ybGZnZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODkwNjYsImV4cCI6MjA3NDI2NTA2Nn0.2iKmQhtTiS9DAniPE9mBy0100HzMtIkc49HBpaZow4s',
  };
</script>
```

Include the snippet ahead of other scripts on pages where you need overrides.

## Supabase configuration

The site expects the following tables inside the provided Supabase project. Enable Row Level Security (RLS) and craft policies appropriate for your organization—examples are provided here for guidance.

### `quality_pricing`

| Column      | Type      | Notes                              |
|-------------|-----------|------------------------------------|
| `rating`    | integer   | Primary key (1–4)                  |
| `amount`    | numeric   | Base payout for the rating         |
| `description` | text    | Optional, displayed on admin table |
| `updated_at` | timestamp | Default `now()` (optional)         |

**Sample SQL**

```sql
create table if not exists quality_pricing (
  rating integer primary key,
  amount numeric not null,
  description text,
  updated_at timestamptz default timezone('utc', now())
);

alter table quality_pricing enable row level security;

create policy "Admins manage pricing" on quality_pricing
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

To restrict updates to admins only, create an auth group/role or custom policies referencing user IDs.

### `phone_quotes`

| Column              | Type      | Notes                                      |
|---------------------|-----------|--------------------------------------------|
| `id`                | uuid      | Default `gen_random_uuid()`                |
| `owner_name`        | text      |                                           |
| `email`             | text      |                                           |
| `phone_model`       | text      |                                           |
| `storage`           | text      | GB capacity                                |
| `rating`            | integer   | Integrity Index score                      |
| `offer`             | numeric   | Calculated offer amount                    |
| `notes`             | text      | Optional                                   |
| `diagnostic_payload`| jsonb     | Raw answers from questionnaire             |
| `created_at`        | timestamptz | Default `now()`                          |

**Sample SQL**

```sql
create table if not exists phone_quotes (
  id uuid primary key default gen_random_uuid(),
  owner_name text not null,
  email text not null,
  phone_model text not null,
  storage text not null,
  rating integer not null,
  offer numeric,
  notes text,
  diagnostic_payload jsonb,
  created_at timestamptz default timezone('utc', now())
);

alter table phone_quotes enable row level security;

create policy "Allow inserts" on phone_quotes
  for insert
  with check (true);
```

### `support_requests`

| Column   | Type      | Notes                     |
|----------|-----------|---------------------------|
| `id`     | uuid      | Primary key               |
| `name`   | text      |                           |
| `email`  | text      |                           |
| `subject`| text      |                           |
| `message`| text      |                           |
| `created_at` | timestamptz | Default `now()`    |

**Sample SQL**

```sql
create table if not exists support_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default timezone('utc', now())
);

alter table support_requests enable row level security;

create policy "Allow customer inserts" on support_requests
  for insert
  with check (true);
```

### Authentication

Create admin users directly in Supabase Authentication and provide them passwords. Those accounts will use Supabase email/password sign-in from the admin portal. Restrict access to pricing tables by enabling RLS policies that permit updates only for authenticated admin roles or specific UUIDs.

## Pricing algorithm

The guided quiz on `sell.html` converts responses into a 1–4 Integrity rating:

- Hard stops: activation lock or a phone that does not power on results in a rating of 1.
- Deduction model: cosmetic, battery, and frame responses apply weighted deductions from 4.
- Rating clamp: after deductions, values are clamped between 1 and 4.
- Offer calculation: the base payout for the rating is multiplied by a storage multiplier (64 GB = 1.0, 128 GB = 1.08, 256 GB = 1.16, 512 GB = 1.25, 1 TB = 1.35). Results round to the nearest whole dollar.

If Supabase pricing cannot be reached, sensible defaults are used so the UI remains functional.

## Deployment

The project is 100% static—host on GitHub Pages or any static hosting provider. Ensure the Supabase domain is allowed in your deployment environment (CORS is handled by Supabase project settings).

## Accessibility & UX

- Semantic markup with section headings and ARIA labels
- Keyboard-accessible modal interactions on the quiz results
- High-contrast palette aligned with TK Phones brand colors
- Responsive layout down to mobile breakpoints

## License

All code in this repository is provided for TK Phones internal use.
