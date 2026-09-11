import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// `prisma generate` only reads the schema — it doesn't need a real database
// connection — but Prisma 7 still evaluates this config eagerly, so a
// missing DATABASE_URL (e.g. during `npm install` before env vars are wired
// up) must not crash it. `migrate` and `db:seed` need the real value, which
// comes from your actual environment (.env locally, or the Vercel project's
// environment variables in production).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
