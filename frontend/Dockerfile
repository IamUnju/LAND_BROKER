FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
# Default backend URL (works for local docker compose); override on Railway
ENV BACKEND_URL=http://backend:8000
EXPOSE 80
CMD ["/docker-entrypoint.sh"]
