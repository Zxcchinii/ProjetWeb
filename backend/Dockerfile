FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]