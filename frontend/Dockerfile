FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Start development server (will be overridden by docker-compose command)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

