FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

COPY . .
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

RUN mkdir -p /app/logs && chown -R node:node /app/logs

USER node

EXPOSE 3000

CMD ["sh", "-c", "yarn typeorm migration:run -d ./dist/typeorm-migration/main.js && node ./dist/apps/backend/main.js"]
