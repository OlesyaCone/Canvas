FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --ignore-scripts

RUN rm -rf node_modules/.pnpm/@esbuild+win32-x64* && pnpm install

COPY . .

ENV CI=true

EXPOSE 5000

CMD ["pnpm", "start"]