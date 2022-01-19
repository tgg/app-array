# syntax=docker/dockerfile:1
# build part
FROM node:16 as envBuild
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --silent
COPY . ./
RUN npm run build

#run part
FROM nginx:stable-alpine
COPY --from=envBuild /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
