# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@9.12.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY scripts ./scripts

# Install frozen deps (persist the exact locked tree, including the
# brace-expansion compatibility patch used by EAS builds).
RUN pnpm install --frozen-lockfile

COPY . .

# Bundle the Express + tRPC server into dist/ with esbuild.
RUN pnpm build

# ---- Runtime stage ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Cloud Run injects the port via PORT (default 8080).
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start"]
