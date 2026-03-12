# BUILD =========================
FROM node:25.2-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY misc ./misc

RUN npm run build

# RUNTIME =======================
FROM node:25.2-alpine AS runtime
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

CMD ["npm", "run", "db:start"]