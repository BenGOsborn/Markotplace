# Compile TypeScript
FROM node:latest
WORKDIR /usr/app
COPY . .
RUN npm install
RUN npm run build

# Copy the files to a new environment
FROM node:latest
WORKDIR /usr/app
COPY package*.json ./
RUN npm install --production
COPY --from=0 /usr/app/dist ./dist

# Start the server
CMD npm run start