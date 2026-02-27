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
# Copy nginx config as a template; envsubst will substitute ${BACKEND_URL} at runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
# Default backend URL (works for local docker compose); override on Railway
ENV BACKEND_URL=http://backend:8000
EXPOSE 80
# Substitute env vars in nginx config then start nginx
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
