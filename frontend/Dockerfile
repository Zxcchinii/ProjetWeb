FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]