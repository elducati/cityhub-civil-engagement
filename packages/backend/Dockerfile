# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init tini
ENV NODE_ENV=production

# Stage 2: Development
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Build
FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --only=production && \
    npm ci --ignore-scripts --include=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && \
    npm prune --production

# Stage 4: Production
FROM base AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["tini", "--", "npm", "run", "start"]