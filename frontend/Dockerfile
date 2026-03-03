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
# Use backend on same primary domain (proxied by nginx, no SSL certification issues)
# Update this to your backend service's private domain if available
ENV BACKEND_URL=https://land-broker-production.up.railway.app
EXPOSE 80
CMD ["/docker-entrypoint.sh"]
