# Dockerfile for a Node.js service
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8885

CMD ["npm", "run", "start"]

