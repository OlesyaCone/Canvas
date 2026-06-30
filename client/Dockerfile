FROM node:22-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .

ENV CI=true
ENV PNPM_APPROVE_BUILDS=true
RUN pnpm build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80