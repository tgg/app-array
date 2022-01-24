Build :
docker build --tag app-array-docker .

Run :
docker run --env NODE_ENV=development --name app-array --publish 3000:80 app-array-docker