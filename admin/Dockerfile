# Dockerfile for a Node.js service
FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8888

# Start the application
CMD ["npm", "start"]

