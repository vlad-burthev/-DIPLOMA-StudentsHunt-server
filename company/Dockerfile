# Dockerfile for a Node.js service
FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Create directories for shared modules
RUN mkdir -p /app/helpers /app/edgrpou /app/httpResponse /app/common

# Expose port
EXPOSE 8881

# Start the application
CMD ["npm", "start"]

