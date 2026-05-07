# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Stage 2: Development
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Stage 3: Build
FROM base AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY vite.config.ts ./
COPY tsconfig.json tsconfig.node.json ./
COPY index.html ./
COPY src ./src
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
