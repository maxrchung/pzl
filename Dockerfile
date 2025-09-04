# Builder
FROM node:24-alpine AS builder

# Working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm ci

# Build the server
RUN npx nx build server

FROM node:24-alpine AS production

WORKDIR /app

# Copy build output
COPY --from=builder /app/apps/server/dist .

# Expose the server port
EXPOSE 3000

# Run the built server
CMD ["node", "main.js"]
