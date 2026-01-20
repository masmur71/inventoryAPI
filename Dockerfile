# --- Stage 1: Builder ---
FROM node:18-alpine AS builder

# Set folder kerja di dalam container
WORKDIR /app

# Copy package.json dan lock file
COPY package*.json ./

# Install SEMUA dependencies (termasuk TypeScript untuk build)
RUN npm install

# Copy seluruh source code
COPY . .

# Build TypeScript ke JavaScript (hasilnya ada di folder dist)
RUN npm run build

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

# Copy package.json lagi
COPY package*.json ./

# Install HANYA dependencies production (tanpa TypeScript/Jest, dll)
RUN npm install --omit=dev

# Copy hasil build (folder dist) dari Stage 1
COPY --from=builder /app/dist ./dist

# Expose port aplikasi
EXPOSE 3000

# Command untuk menjalankan aplikasi
CMD ["node", "dist/server.js"]