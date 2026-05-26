FROM node:20-alpine AS builder

WORKDIR /app

# Copies package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate prisma client and build the app
RUN npx prisma generate
RUN npm run build

# Second stage: runtime
FROM node:20-alpine

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 80

# Start the application
CMD ["npm", "run", "start:prod"]
