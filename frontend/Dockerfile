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
# Default backend URL (works for local docker compose); override on Railway
ENV BACKEND_URL=http://backend:8000
EXPOSE 80
# Use sed to replace ${BACKEND_URL} placeholder, then start nginx
CMD /bin/sh -c "sed \"s|\${BACKEND_URL}|${BACKEND_URL}|g\" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && cat /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
