# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source
COPY src/ ./src/
COPY package.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "src/server.js"]

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy application source
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start in development mode with hot reload
CMD ["npm", "run", "dev"]
