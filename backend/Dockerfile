# ==============================================================================
# AmongU Backend - Production Multi-Stage Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies required for compilation)
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript in /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime Stage
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency manifests and install production-only dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Set file ownership to non-root user
RUN chown -R node:node /app

# Switch to the unprivileged 'node' user
USER node

# Expose backend service port
EXPOSE 5000

# Container health check targeting the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(res => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

# Launch backend application
CMD ["node", "dist/server.js"]
