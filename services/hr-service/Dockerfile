FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY services/hr-service/package.json ./services/hr-service/
COPY shared/types/package.json ./shared/types/
COPY shared/utils/package.json ./shared/utils/
COPY shared/auth-middleware/package.json ./shared/auth-middleware/
COPY shared/service-client/package.json ./shared/service-client/

# Install dependencies
RUN npm install

# Copy source files
COPY shared ./shared
COPY services/hr-service ./services/hr-service

# Build shared packages
RUN npm run build --workspace=@vibe/types
RUN npm run build --workspace=@vibe/utils
RUN npm run build --workspace=@vibe/auth-middleware
RUN npm run build --workspace=@vibe/service-client

# Generate Prisma client and build
WORKDIR /app/services/hr-service
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/hr-service/dist ./dist
COPY --from=builder /app/services/hr-service/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/services/hr-service/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3003

CMD ["node", "dist/server.js"]
