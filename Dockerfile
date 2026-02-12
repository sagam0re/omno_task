# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist

COPY --from=builder /usr/src/app/src/infrastructure/migrations ./dist/infrastructure/migrations

EXPOSE 3000

CMD ["sh", "-c", "node dist/infrastructure/migrate.js && node dist/server.js"]
