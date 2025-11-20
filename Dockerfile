# Dockerfile.app
FROM node:20-alpine

WORKDIR /app

# Copy only what's needed first for caching
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Generate Prisma Client inside the container (linux-musl)
RUN npx prisma generate

# Now copy the rest of the app
COPY . .

# Default command for the web app container
CMD ["npm", "start"]
