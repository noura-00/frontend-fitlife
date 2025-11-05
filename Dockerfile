# Base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy all application files
COPY . .

# Expose frontend port
EXPOSE 5174

# Run dev server with host and port flags for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
