# BUILD =========================
FROM node:25.2-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
COPY misc ./misc

RUN npm run db:generate
RUN npm run build

# RUNTIME =======================
FROM node:25.2-alpine AS runtime
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

CMD ["npm", "run", "db:start"]