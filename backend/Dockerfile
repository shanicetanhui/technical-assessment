# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN mkdir -p uploads

EXPOSE 4000
CMD ["node", "index.mjs"]
