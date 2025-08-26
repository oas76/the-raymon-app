# Simple single-stage build that mirrors local setup
FROM node:18-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies (dev + prod) 
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose port
EXPOSE 5001

# Set working directory to backend (like local)
WORKDIR /app/backend

# Start the application (simple, like local)
CMD ["npm", "start"]
