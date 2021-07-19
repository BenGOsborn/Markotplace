# Compile the Go server
FROM golang:latest
WORKDIR /usr/app
COPY . .
RUN go mod download
RUN go build main.go

# Copy the files to a new server
FROM ubuntu:latest
WORKDIR /usr/app
COPY --from=0 /usr/app/main .

# Start the server
CMD ./main