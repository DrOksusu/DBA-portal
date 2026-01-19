FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY services/inventory-service/package.json ./services/inventory-service/
COPY shared/types/package.json ./shared/types/
COPY shared/utils/package.json ./shared/utils/
COPY shared/auth-middleware/package.json ./shared/auth-middleware/
COPY shared/service-client/package.json ./shared/service-client/

RUN npm install

COPY shared ./shared
COPY services/inventory-service ./services/inventory-service

RUN npm run build --workspace=@vibe/types
RUN npm run build --workspace=@vibe/utils
RUN npm run build --workspace=@vibe/auth-middleware
RUN npm run build --workspace=@vibe/service-client

WORKDIR /app/services/inventory-service
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/inventory-service/dist ./dist
COPY --from=builder /app/services/inventory-service/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/services/inventory-service/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3004

CMD ["node", "dist/server.js"]
