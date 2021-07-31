# Build the application
FROM node:latest as build
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

# Copy built files to production environment
FROM node:latest
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY --from=build /usr/app/.next ./.next
COPY --from=build /usr/app/public ./public

# Start the server
CMD npm run start