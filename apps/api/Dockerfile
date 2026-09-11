FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json apps/api/
RUN npm install --workspace apps/api --include-workspace-root --no-audit --no-fund
COPY . .
RUN npm run db:generate && npm run build:api

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY package.json ./package.json
COPY apps/api/package.json ./apps/api/package.json
EXPOSE 4000
CMD ["node","apps/api/dist/server.js"]
