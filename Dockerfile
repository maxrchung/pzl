FROM node:24-alpine

# Set working directory inside the container
WORKDIR /app

# Copy only the files we need for server
COPY . .

# Install deps (monorepo root)
RUN npm ci

# Build the server
RUN npx nx build server

# Expose the server port
EXPOSE 3000

# Run the built server
CMD ["node", "apps/server/dist/main.js"]
