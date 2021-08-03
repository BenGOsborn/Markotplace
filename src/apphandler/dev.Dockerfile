# Build the environment
FROM golang
WORKDIR /usr/app

# Start the server
CMD go run main.go