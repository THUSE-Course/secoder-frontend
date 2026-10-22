FROM node:24.22.1-alpine@sha256:feb76650b7195319268c59cb2d419c732d6c499b13bf5296f16ab59eb1f0a4f3 AS builder
RUN apk upgrade --no-cache && npm install -g npm@12.2.1 pnpm@12.14.0
WORKDIR /srv
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm lint && pnpm build

FROM nginx:stable-alpine@sha256:c59d1f8b1e0e42da75be973424cd72e23f7f8adfb54e982f4d1cd0216a5a5576 AS runtime
RUN apk upgrade --no-cache && update-ca-certificates
COPY --from=builder /srv/dist /usr/share/nginx/html
COPY .env /usr/share/nginx/html/.env
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
