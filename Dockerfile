# Iki asamali (multi-stage) build:
# 1. asama: Vue projesini "build" edip statik HTML/CSS/JS dosyalarina cevirir.
# 2. asama: sadece o statik dosyalari kucuk bir nginx sunucusuna koyar.
# Boylece son image icinde Node.js, node_modules gibi gereksiz seyler kalmaz,
# image kucuk ve hizli olur.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
