# Use official Node.js image (Alpine for smaller size)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
