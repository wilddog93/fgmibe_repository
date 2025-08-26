# syntax=docker/dockerfile:1.6

########################################
# 1) Dependencies (untuk build)
########################################
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile
# generate prisma client (aman kalau tidak ada prisma)
RUN npx prisma generate || true

########################################
# 2) Build (TS -> build/)
########################################
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
# pastikan folder build ada
RUN test -d build || (echo "ERROR: Folder 'build' tidak ditemukan. Cek script build & tsconfig outDir." && ls -la && exit 1)

########################################
# 3) Runtime (minimal, non-root)
########################################
FROM node:20-bookworm-slim AS runner
WORKDIR /usr/src/node-app
ENV NODE_ENV=production
ENV PORT=4000
# jika nanti outDir diganti, ubah ini
ENV BUILD_DIR=build
USER node

# install dependency production saja agar ringan
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma ./prisma
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production=true \
 && npx prisma generate || true

# copy hasil build
COPY --chown=node:node --from=build /app/${BUILD_DIR} ./${BUILD_DIR}

EXPOSE 4000
# coba server.js lalu fallback ke index.js
CMD ["/bin/sh","-lc","node \"$BUILD_DIR/server.js\" 2>/dev/null || node \"$BUILD_DIR/index.js\""]
