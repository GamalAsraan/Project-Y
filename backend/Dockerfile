FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and ensure proper permissions
RUN npm install && \
    chmod -R 755 /app/node_modules/.bin

# Copy application files
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
