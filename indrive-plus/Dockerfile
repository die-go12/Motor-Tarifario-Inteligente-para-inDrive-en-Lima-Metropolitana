FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist
CMD ["node", "dist/apps/ms-base/main"]
