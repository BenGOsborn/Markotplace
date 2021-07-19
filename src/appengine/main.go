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
	"time"

	"appengine/containerutils"
)

// Initialize default values
const PORT = 4000
var ctx context.Context = context.Background()
var containers = []containerutils.Container{}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow get requests
	if r.Method != http.MethodGet {
		fmt.Println("Called")
		w.WriteHeader(400)
		return
	}

	// Get the AppID from the query (*********I am aware this is bad practice I just want it to work)
	appIDs, ok := r.URL.Query()["appID"]

	if !ok || len(appIDs) < 1 {
		w.WriteHeader(400)
		return
	}
	appID := appIDs[0]


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

	// Start the container if it does not exist, otherwise get the port for the container
	if !container.Active {
		forwardPort = containerutils.GetPort()
		container.StartContainer(ctx, forwardPort) // **** What is the difference between modifying this variable and modifying the one from the for loop in CleanupContainers
	} else {
		forwardPort = container.Port
	}

	// Refresh the last hit time
	container.LastHit = time.Now()

	// ********* Also if I implement a firewall this is going to break for sure (the reverse proxy might have to return somehow)

	// Parse the origin URL
	redirectURL := fmt.Sprintf("http://0.0.0.0:%d", forwardPort)
	http.Redirect(w, r, redirectURL, http.StatusSeeOther)
} 

func main() {
	// Start the container cleanup process
	go containerutils.CleanupContainers(ctx, &containers)

	// Handle the main container redirect route
	http.HandleFunc("/", redirectHandler)

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}