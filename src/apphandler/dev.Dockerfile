# Build the environment
FROM golang
WORKDIR /usr/app
RUN apt-get update && apt-get install -y \
    software-properties-common \
    npm
RUN npm install npm@latest -g && \
    npm install n -g && \
    n latest
RUN npm install -g nodemon

# Start the server
CMD nodemon --watch ../appmanager/ --ext '*' --signal SIGTERM --exec go run main.go