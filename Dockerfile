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

# Install sharp separately again because it contains binaries that esbuild
# doesn't bundle for some reason. I'm not a huge fan of this since this is
# pretty brittle but is probably more resistant than manually copying the binary
# over. Until `generatePackageJson` gets supported again for esbuild, I think
# I'm gonna go with esbuild third party bundle and this shenanigan.
RUN npm install sharp

# Copy build output
COPY --from=builder /app/apps/server/dist .

# Expose the server port
EXPOSE 3000

# Run the built server
CMD ["node", "main.js"]
