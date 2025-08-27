# Gunakan Node LTS slim
FROM node:20-bookworm-slim

# Working directory di container
WORKDIR /usr/src/node-app

# Copy package.json + yarn.lock dulu
COPY package.json yarn.lock ./

# Install semua deps termasuk devDependencies (ts-node)
RUN yarn install --frozen-lockfile

# Copy seluruh source + Prisma
COPY prisma ./prisma
COPY src ./src

# Environment
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Jalankan server langsung dari TS
CMD ["ts-node", "src/index.ts"]
