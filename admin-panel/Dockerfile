FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/admin/package*.json ./apps/admin/

COPY packages/plugins/package*.json ./packages/plugins/

RUN apk add --no-cache openssl libc6-compat

RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

RUN npm run build -w apps/admin

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/apps/admin/public ./public
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static

EXPOSE 3000

CMD ["node", "apps/admin/server.js"]
