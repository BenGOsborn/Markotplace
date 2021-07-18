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

	"appengine/containerutils"
)

// Initialize default values
const PORT = 3000
var servers = []string{"http://0.0.0.0:4000"}
var ctx context.Context = context.Background()
var containers = []containerutils.Container{}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow get requests
	if r.Method != http.MethodGet {
		w.WriteHeader(400)
		return
	}

	// Get the AppID from the path
	appID := r.URL.Path
	if len(appID) > 0 {
		appID = appID[1:]
	}

	// Check if the specified path is valid
	container, err := containerutils.GetContainer(ctx, appID, &containers)
	if err != nil {
		w.WriteHeader(500)
		return
	} else if container == nil {
		w.WriteHeader(404)
		return
	}

	// Initialize the forward URL
	var forwardPort int

	// Start up a container if it does not exist otherwise use the existing container
	if container.Active {
		forwardPort = container.Port
	} else {
		// Find a valid port and start the container on it
	}

	// Parse the origin URL
	origin, _ := url.Parse(fmt.Sprintf("http://0.0.0.0:%d", forwardPort)) // I should change localhost to the actual name of the running app (0.0.0.0 ?)

	// Create the reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(origin)

	// Initialize the proxy
	proxy.ServeHTTP(w, r)
} 

func main() {
	http.HandleFunc("/", proxyHandler)

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}