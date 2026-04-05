FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN DATABASE_URL="postgresql://user:password@localhost:5432/db" npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "startdev"]
