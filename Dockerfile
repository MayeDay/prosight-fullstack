# ── Stage 1: Build React ──────────────────────────────────────────────────
FROM node:20-alpine AS react-build
WORKDIR /react
COPY prosight-client/package*.json ./
RUN npm ci --silent
COPY prosight-client/ ./
RUN npm run build

# ── Stage 2: Node.js API ──────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app
COPY prosight-server/package*.json ./
RUN npm ci --production
COPY prosight-server/ ./
RUN npx prisma generate

# Copy React build into public folder so Express serves it
COPY --from=react-build /react/build ./public

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
