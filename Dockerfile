# Multi-stage build for production deployment
FROM node:18-alpine AS backend-build

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Frontend build stage
FROM node:18-alpine AS frontend-build

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001

# Set working directory
WORKDIR /app

# Copy backend
COPY --from=backend-build --chown=appuser:nodejs /app/backend ./backend
COPY --from=frontend-build --chown=appuser:nodejs /app/frontend/build ./frontend/build

# Create uploads directory
RUN mkdir -p backend/uploads && chown appuser:nodejs backend/uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["dumb-init", "node", "backend/server.js"]
