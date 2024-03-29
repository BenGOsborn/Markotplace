# Build binary
FROM golang AS build
WORKDIR /usr/app
COPY . .
RUN go mod download
RUN go build -o main .

# Copy binary to new environment
FROM ubuntu:latest
WORKDIR /usr/app
COPY --from=build /usr/app/main .

# Start the server
CMD ./main