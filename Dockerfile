# syntax=docker/dockerfile:1.6

########################################
# 1) Dependencies
########################################
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
# (opsional bila pakai Prisma)
COPY prisma ./prisma
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile
# generate prisma client jika ada, abaikan kalau tidak ada prisma
RUN npx prisma generate || true

########################################
# 2) Build
########################################
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Pastikan script build ada dan menghasilkan folder dist/
RUN yarn build

# Fail fast kalau dist tidak ada (biar error-nya jelas)
RUN test -d dist || (echo "ERROR: Folder 'dist' tidak ditemukan setelah build. Cek script build & tsconfig 'outDir'." && ls -la && exit 1)

########################################
# 3) Runtime
########################################
FROM node:20-bookworm-slim AS runner
WORKDIR /usr/src/node-app
ENV NODE_ENV=production
ENV PORT=4000
# folder output build (kalau nanti ingin ganti ke 'build', tinggal ubah ENV ini)
ENV BUILD_DIR=build
USER node
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/${BUILD_DIR} ./${BUILD_DIR}
EXPOSE 4000
# pakai shell form agar $BUILD_DIR diexpand
CMD node $BUILD_DIR/server.js
