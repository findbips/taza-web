# TAZA — Production v1 Full-Stack Foundation

Premium natural-food commerce platform for TAZA, built for Bangladesh-first launch and later scale.

## Stack
- Next.js 16 + React 19 frontend
- Node.js + Express 5 API
- PostgreSQL + Prisma 7
- JWT session in HttpOnly cookie
- Zod request validation
- Helmet + CORS + rate limiting
- Docker Compose for local PostgreSQL

## Features included
- Premium TAZA storefront and brand system
- Product catalog/search/categories
- Product details + approved reviews
- Cart persisted in browser
- Checkout + COD flow
- Customer accounts and order history
- Customer address API
- Coupon validation + usage accounting
- Order inventory decrement with race-safe conditional updates
- Production batches / best-before data model
- Partner/influencer attribution + commission model
- Admin statistics, customers, orders, products, batches
- Payment status + provider configuration endpoints
- Newsletter and contact capture
- Security headers, request validation, rate limiting

## Important: payment and delivery
The code intentionally does **not** pretend to have live bKash/Nagad/SSLCommerz or courier credentials. Provider credentials, webhook signature verification, and courier API contracts must be configured and tested with the merchant accounts before accepting live transactions.

## Local setup
1. Install Node 20.9+ (Node 24 recommended).
2. Copy `.env.example` to `.env`.
3. Run `docker compose up -d`.
4. Run `npm install`.
5. Run `npm run db:generate`.
6. Run `npm run db:migrate`.
7. Run `npm run db:seed`.
8. Run `npm run dev`.

Web: http://localhost:3000
API: http://localhost:4000/api/health

## Admin seed
Email: admin@taza.bd
Password: ChangeMe123!

Change this immediately outside development.

## Production deployment model
- Next.js web: Vercel or equivalent
- Express API: Railway/Render/Fly.io/AWS/etc.
- PostgreSQL: managed provider with backups/PITR
- Product media: S3-compatible object storage + CDN
- Secrets: platform secret manager
- DNS: taza.bd points to the production web host/API as appropriate

See `PRODUCTION_CHECKLIST.md` before launch.
