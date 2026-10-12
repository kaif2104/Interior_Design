# Multi-stage production build for Interior Design Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install curl for container health check
RUN apk --no-cache add curl

# Copy only production dependencies and source
COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app ./

EXPOSE 8080

USER node

CMD ["node", "server.js"]