# TAZA — full-stack, Vercel-ready

Premium natural-food commerce app for TAZA / taza.bd. Originally a two-service
monorepo (Next.js web + Express API), merged into a **single Next.js app** so
it deploys to Vercel with nothing else to host.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- API routes live in `app/api/**/route.ts` (replaces the old Express server)
- PostgreSQL + Prisma 7
- Zod validation, JWT in an HttpOnly cookie
- TAZA botanical-luxury design system

## Why it changed from the original POC
Vercel only runs serverless functions — it can't host a long-running Express
server or a Docker/Postgres container. So the Express routes were rewritten
as Next.js Route Handlers in this same app, and Postgres moved to a managed,
serverless-friendly provider (Neon works great with Vercel and has a free
tier). The frontend needed **no changes** — it already called relative
`/api/...` paths.

## 1. Get a Postgres database
Easiest: [neon.tech](https://neon.tech) → new project → copy the connection
string (use the "pooled connection" string, includes `?sslmode=require`).
Vercel Postgres or Supabase work the same way — any standard `DATABASE_URL`.

## 2. Local setup
```bash
npm install
cp .env.example .env
# edit .env: paste your DATABASE_URL, set a real JWT_SECRET
npm run db:migrate     # creates tables (prompts for a migration name the first time)
npm run db:seed        # seeds products + admin user
npm run dev
```
Visit http://localhost:3000. Seed admin: `admin@taza.bd` / `ChangeMe123!` —
change this before putting real data behind it.

## 3. Push to GitHub
```bash
git init
git add .
git commit -m "TAZA — Vercel-ready"
gh repo create taza --source=. --private --push
# or: create a repo on github.com, then
#   git remote add origin <your-repo-url>
#   git push -u origin main
```

## 4. Deploy to Vercel
1. [vercel.com/new](https://vercel.com/new) → import the GitHub repo. Next.js
   is auto-detected, no config needed.
2. Add environment variables (Project Settings → Environment Variables):
   - `DATABASE_URL` — same Neon connection string
   - `JWT_SECRET` — a long random string (`openssl rand -hex 32`)
3. Deploy. `postinstall` runs `prisma generate` automatically during the
   build, so the Prisma client is always in sync with `prisma/schema.prisma`.
4. **Run migrations against the production database once**, from your
   machine (with `.env` pointed at the same `DATABASE_URL` you gave Vercel):
   ```bash
   npm run db:deploy   # prisma migrate deploy — applies existing migrations, no prompts
   npm run db:seed     # optional: seed products + admin user
   ```
   Do this once after the first deploy, and again after any schema change.

That's it — the whole app (storefront, cart, checkout, auth, admin) runs
from the one Vercel deployment.

## Project structure
```
app/                  Pages (storefront, cart, checkout, account, admin)
app/api/**/route.ts   API routes (auth, products, orders, admin, newsletter, contact)
components/           Cart provider, header, add-to-cart, newsletter form
lib/db.ts             Prisma client singleton
lib/auth.ts           JWT + cookie helpers, role guards, error handling
lib/api.ts            Tiny fetch wrapper used by client components
prisma/schema.prisma  Data model
prisma/seed.ts        Seed script (admin user + starter products)
```

## Admin area
`/admin` (overview), `/admin/products`, `/admin/orders`, `/admin/subscribers`
— all require an ADMIN-role account. Sign in at `/account` with the seed
admin, or promote a user's `role` to `ADMIN` directly in the database.

## Production next steps
Payment gateway (SSLCommerz/bKash/Nagad), transactional email, image
upload/CDN for products, password reset/email verification, rate limiting,
audit logs, and automated tests.
