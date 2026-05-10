# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY packages/frontend/package.json ./
RUN npm install

# Stage 3: Development
FROM deps AS development
WORKDIR /app
COPY packages/frontend/ ./
EXPOSE 5173
CMD ["sh", "-c", "npm install && npm run dev"]

# Stage 4: Build
FROM deps AS build
WORKDIR /app
COPY packages/frontend/ ./
RUN npm run build

# Stage 5: Production
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static/
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build /app/package.json ./
USER nextjs
EXPOSE 5173
ENV PORT 5173
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]