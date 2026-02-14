# Base stage
FROM oven/bun:1 AS base
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY libs/db/package.json ./libs/db/
COPY apps/api/package.json ./apps/api/
COPY apps/sync/package.json ./apps/sync/

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Generate DB client
RUN bun run db:generate

# API Stage
FROM base AS api
EXPOSE 9001
CMD ["bun", "run", "api:start"]

# Sync Stage
FROM base AS sync
CMD ["bun", "run", "sync:start"]
