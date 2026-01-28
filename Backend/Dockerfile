FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "run", "startdev"]
