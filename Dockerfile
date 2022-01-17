# syntax=docker/dockerfile:1
FROM node:16
ENV NODE_ENV=development 
RUN mkdir /app
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
