# syntax=docker/dockerfile:1.6

########################################
# 1) Dependencies (build stage)
########################################
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile
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
RUN test -d build || (echo "ERROR: Folder 'build' tidak ditemukan. Cek script build & tsconfig outDir." && ls -la && exit 1)

########################################
# 3) Runner (minimal, non-root)
########################################
FROM node:20-bookworm-slim AS runner
WORKDIR /usr/src/node-app
ENV NODE_ENV=production
ENV PORT=4000
ENV BUILD_DIR=build
USER node

COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma ./prisma
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production=true \
 && npx prisma generate || true

COPY --chown=node:node --from=build /app/$BUILD_DIR ./$BUILD_DIR
COPY --chown=node:node start.sh ./
RUN chmod +x start.sh

EXPOSE 4000
CMD ["./start.sh"]
