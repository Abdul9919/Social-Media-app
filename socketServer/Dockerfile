FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g nodemon

RUN npm install

COPY . .


EXPOSE 4999

CMD ["npm", "run", "socket:start"]
