# TAZA Production v1 checklist

## Required before launch
- [ ] Use managed PostgreSQL with automated backups and PITR.
- [ ] Set a unique 32+ character JWT_SECRET in the production secret manager.
- [ ] Set NODE_ENV=production and exact WEB_ORIGIN.
- [ ] Deploy API and web over HTTPS.
- [ ] Configure a production image/object-storage provider and CDN.
- [ ] Replace placeholder product imagery with licensed/owned TAZA assets.
- [ ] Implement and verify bKash, Nagad and/or SSLCommerz production credentials.
- [ ] Verify webhook signatures and idempotency for every payment provider.
- [ ] Add courier API credentials and delivery status callbacks.
- [ ] Configure transactional email (order confirmation, password reset, shipping updates).
- [ ] Add privacy policy, terms, refund/return policy, delivery policy and cookie notice as applicable.
- [ ] Configure domain DNS, SPF/DKIM/DMARC for email.
- [ ] Configure monitoring/error tracking and uptime checks.
- [ ] Configure database backups and restore test.
- [ ] Run dependency audit and security review.
- [ ] Load test checkout and inventory race conditions.
- [ ] Test coupon, stock, cancellation, refund and partner commission edge cases.
- [ ] Create a non-admin support account and disable/change seed credentials.

## Recommended deployment
- Web: Vercel or another Next.js-compatible host.
- API: Railway, Render, Fly.io, AWS, or another Node.js host.
- Database: managed PostgreSQL.
- Images: S3-compatible object storage + CDN.
- Secrets: platform secret manager; never commit .env.
