# Base image
FROM node:18

# Set working directory
WORKDIR ./

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port your app runs on (if applicable)
EXPOSE 8881

# Command to start the app
CMD ["npm", "run", "dev"]
