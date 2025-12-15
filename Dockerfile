# 1) Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install OS deps if needed (uncomment if you later need them)
# RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the app source
COPY . .

# Build Next.js app for production
ENV NODE_ENV=production
RUN npm run build

# 2) Runtime stage (lighter image)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Don’t run as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only what’s needed to run the built app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

# Next.js production server
CMD ["npm", "start"]
