# Build the environment
FROM node:latest
WORKDIR /usr/app
RUN npm install -g nodemon

RUN wget https://golang.org/dl/go1.16.6.linux-amd64.tar.gz && rm -rf /usr/local/go && tar -C /usr/local -xzf go1.16.6.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin
RUN rm go1.16.6.linux-amd64.tar.gz

# Start the server
CMD nodemon --watch ../appmanager/ --ext '*' --signal SIGTERM --exec go run main.go