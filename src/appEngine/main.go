package main

// This should be responsible for spinning up the different Docker containers and tracking them
// It should also listen for new merges / commits and build a Docker file from them (using some naming convention)
// The service should receive a game request, then attempt to fetch that game (after validating they can have it)
// The server will then attempt to spin up a container for that game (and its last request ping)
// The different running containers will be monitored for their last response and will be put to sleep if unused
// If a user submits a bad Dockerfile which cant be run, their previous code will be submitted instead (and some sort of flag will be set for them ?)

// Different checks will have to be done concurrently and shared across memory (store in Redis cache)
// Make the containers expire after a while

// In the future, I can store the data that details the containers in a shared cache (Redis) which can then map the request to the correct instance of the apps (if I make multiple instances with a load balancer)

// First step is going to be designing the main layout of the page

// Reverse proxy: https://www.integralist.co.uk/posts/golang-reverse-proxy/ OR https://medium.com/swlh/proxy-server-in-golang-43e2365d9cbc + https://github.com/akashjain132/load-balancer/blob/master/main.go

import (
	"fmt"
	"log"
	"net/http"
)

// Initialize default values
const PORT = 3000
var serverHits = 0
var servers []string

// LAN Docker

func main() {
	// Initialize the servers
	servers = append(servers, "https://google.com", "https://facebook.com", "https://youtube.com")

	// Handle routes
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Index")
		log.Println("Index hit")
	})

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}