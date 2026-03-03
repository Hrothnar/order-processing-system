# BUILD =========================
FROM node:25.2-alpine AS build

WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install

COPY miscellaneous ./miscellaneous
COPY src ./src

RUN npm run build

# RUNTIME =======================
FROM node:25.2-alpine AS runtime

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3032

CMD ["node", "dist/index.js"]