# syntax=docker/dockerfile:1.6

### 1) Install deps + generate Prisma client
FROM node:20-bookworm-slim AS deps
WORKDIR /app
# (opsional, sering tak perlu) library umum; uncomment kalau butuh
# RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json yarn.lock ./
# copy schema dulu agar prisma generate bisa di-cache
COPY prisma ./prisma
# cache yarn (aktif kalau DOCKER_BUILDKIT=1)
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile
# generate prisma client jika dipakai
RUN npx prisma generate || true

### 2) Build aplikasi (mis. TypeScript -> dist)
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# sesuaikan kalau tidak pakai TS: hapus 'yarn build'
RUN yarn build && yarn cache clean

### 3) Runner minimal, non-root
FROM node:20-bookworm-slim AS runner
WORKDIR /usr/src/node-app
ENV NODE_ENV=production
ENV PORT=4000
# pakai user 'node' bawaan image
USER node
# hanya file yang perlu untuk runtime
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
EXPOSE 4000
# sesuaikan entry point kamu
CMD ["node", "dist/server.js"]
