package main

// Make the containers expire after a while
// Docker containers that can spawn siblings
// In the future, I can store the data that details the containers in a shared cache (Redis) which can then map the request to the correct instance of the apps (if I make multiple instances with a load balancer)

// Reverse proxy: https://www.integralist.co.uk/posts/golang-reverse-proxy/ OR https://medium.com/swlh/proxy-server-in-golang-43e2365d9cbc + https://github.com/akashjain132/load-balancer/blob/master/main.go + https://hackernoon.com/writing-a-reverse-proxy-in-just-one-line-with-go-c1edfa78c84b + https://github.com/bechurch/reverse-proxy-demo
// Docker siblings: https://forums.docker.com/t/how-can-i-run-docker-command-inside-a-docker-container/337/6
// SECURITY FOR MOUNTED VOLUMES: https://medium.com/@axbaretto/best-practices-for-securing-containers-8bf8ae0d9952 + https://stackoverflow.com/questions/40844197/what-is-the-docker-security-risk-of-var-run-docker-sock
// Pausing and restarting containers: https://stackoverflow.com/questions/34782678/difference-between-running-and-starting-a-docker-container (maybe put some of these in a deep sleep after an hour or so)

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"

	"appengine/containerutils"
)

// Initialize default values
const PORT = 3000
var serverHits = 0
var servers = []string{"http://localhost:4000"}
var ctx context.Context = context.Background()
var containers *[]containerutils.Container

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// Get the target server to redirect to and increment the server hits
	target := servers[serverHits % len(servers)]
	serverHits++

	// Parse the origin URL
	origin, _ := url.Parse(target)

	// Create the reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(origin)

	// Initialize the proxy
	proxy.ServeHTTP(w, r)

	// Log the message
	log.Println("Proxy called")
} 

func cleanupContainers(containers *[]containerutils.Container) {
	// Continuously filter out unused containers
	for {
		// Filter out the expired containers
		var newContainers = []containerutils.Container{}
		
		for _, ctr := range *containers {
			if ctr.Expired() {
				if ctr.Active {
					// Stop the container
					ctr.StopContainer(ctx)
				}
			} else {
				// Add the container to the list
				newContainers = append(newContainers, ctr)
			}
		}

		// Set the new containers
		*containers = newContainers

		// Sleep
		time.Sleep(20 * time.Minute)
	}
}

func main() {
	container := containerutils.NewContainer("bengosborn/ts-wasmbird")
	if startErr := container.StartContainer(ctx, 4000); startErr != nil {
		panic(startErr)
	}
	if stopErr := container.StopContainer(ctx); stopErr != nil {
		panic(stopErr)
	}

	http.HandleFunc("/", proxyHandler)

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}