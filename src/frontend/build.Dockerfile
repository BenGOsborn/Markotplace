# Build the application
FROM node:latest as build
WORKDIR /usr/app
COPY . .
RUN npm install
ARG BACKEND_HOSTNAME
RUN npm run build

# Copy built files to production environment
FROM node:latest
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY --from=build /usr/app/.next ./.next
COPY --from=build /usr/app/public ./public

# Disable tracking
ENV NEXT_TELEMETRY_DISABLED 1

# Start the server
CMD npm run start