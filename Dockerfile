# syntax=docker/dockerfile:1.6

########################################
# 1) Dependencies
########################################
FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile
RUN npx prisma generate || true

########################################
# 2) Build stage (TS -> build/)
########################################
FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# pastikan folder build ada
RUN test -d build || (echo "ERROR: Folder 'build' tidak ditemukan. Cek tsconfig & script build." && ls -la && exit 1)

########################################
# 3) Runtime stage (minimal, non-root)
########################################
FROM node:20-bookworm-slim AS runner
WORKDIR /usr/src/node-app
ENV NODE_ENV=production
ENV PORT=4000
ENV BUILD_DIR=build

# Copy package.json & prisma
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma ./prisma

# Install production deps
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --production=true \
 && npx prisma generate || true

# Copy hasil build dari stage build
COPY --chown=node:node --from=build /app/build ./build

# Copy start.sh sebagai root, chmod, baru switch ke node
COPY start.sh ./
RUN chmod +x start.sh
USER node

EXPOSE 4000

CMD ["./start.sh"]
