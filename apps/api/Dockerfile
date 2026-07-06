FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

# モノレポのワークスペース定義とロックファイルを先にコピー
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN cd apps/api && pnpm db:generate

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["pnpm", "dev"]
