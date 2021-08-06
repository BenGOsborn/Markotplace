# Build the environment
FROM node:latest
WORKDIR /usr/app
RUN npm install -g nodemon

# Download and install Golang
ARG GO_VERSION=1.16.5
RUN wget https://golang.org/dl/go${GO_VERSION}.linux-amd64.tar.gz && rm -rf /usr/local/go && tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin
RUN rm go${GO_VERSION}.linux-amd64.tar.gz

# Start the server
CMD nodemon --watch ../app/ --ext '*' --signal SIGTERM --exec go run main.go