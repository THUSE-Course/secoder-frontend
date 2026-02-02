FROM node:25-alpine AS builder
RUN npm install -g pnpm
WORKDIR /srv
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN VITE_API_ENDPOINT=/api pnpm build

FROM nginx:alpine AS runtime
COPY --from=builder /srv/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
