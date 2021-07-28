# Compile the Go server
FROM golang
WORKDIR /usr/app
COPY . .
RUN go mod download
RUN go build main.go

# Copy the files to a new environment
FROM ubuntu
WORKDIR /usr/app
COPY --from=0 /usr/app/main .

# Start the server
CMD ./main