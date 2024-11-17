FROM node:20-alpine AS base

FROM base AS builder

WORKDIR /app

COPY . .

RUN apk add --update --no-cache python3 make gcc g++ && ln -sf python3 /usr/bin/python

RUN yarn install --frozen-lockfile
RUN yarn build

FROM base AS installer

RUN apk add --no-cache curl bash

WORKDIR /app

COPY --from=builder /app/dist/apps/backend /app/dist/apps/backend
COPY --from=builder /app/dist/apps/frontend /app/dist/apps/frontend
COPY --from=builder /app/dist/typeorm-migration /app/dist/typeorm-migration

COPY --from=builder /app/dist/libs/common /app/dist/libs/common

# Copy root package files
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/yarn.lock /app/yarn.lock


RUN apk add --update --no-cache python3 make gcc g++ && ln -sf python3 /usr/bin/python

RUN chown -R node:node /app

USER node

RUN yarn --frozen-lockfile --prod

EXPOSE 3000

CMD ["sh", "-c", "yarn typeorm migration:run -d ./dist/typeorm-migration/main.js && node ./dist/apps/backend/main.js"]
