# Multi-stage production build for Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build)
RUN npm ci

# Copy application source code
COPY . .

# Build step (if your project has a build script, e.g. TypeScript / Webpack / Next)
# Uncomment the following line if applicable:
# RUN npm run build --if-present

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install curl for health check
RUN apk --no-cache add curl

# Copy only production dependencies and build artifacts
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app ./

# Expose production port
EXPOSE 8080

# Run non-root user for container security
USER node

CMD ["npm", "start"]