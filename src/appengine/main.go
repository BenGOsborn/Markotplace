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
const PORT = 4000
var ctx context.Context = context.Background()
var containers = []containerutils.Container{}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow get requests
	if r.Method != http.MethodGet {
		fmt.Println("Called")
		w.WriteHeader(400)
		return
	}

	// Get the AppID from the query (*********I am aware this is bad practice I just want it to work)
	appIDs := r.URL.Query()
	fmt.Println(appIDs)
	
	// IT IS BECAUSE THE REQUESTS FROM THE PAGE ARE HAVING THEIR QUERY PARSED TOO
	// Maybe I can send along a session token which can be used to tell the server what URL it is going to ?

	// if !ok || len(appIDs) < 1 {
	// 	w.WriteHeader(400)
	// 	return
	// }
	// appID := appIDs[0]
	// fmt.Println(appID)

	// appID := "bengosborn/ts-wasmbird"

	// // Check if the specified path is valid
	// container, err := containerutils.GetContainer(ctx, appID, &containers)
	// if err != nil {
	// 	w.WriteHeader(500)
	// 	return
	// } else if container == nil {
	// 	w.WriteHeader(404)
	// 	return
	// }

	// // Initialize the forward URL
	// var forwardPort int

	// // Set the port of the container
	// if container.Port != 0 {
	// 	// If the port is something other than default
	// 	forwardPort = container.Port
	// } else {
	// 	// Find a valid port and start the container on it
	// 	forwardPort = containerutils.GetPort(&containers)
	// }

	// // Start the container if it does not exist
	// if !container.Active {
	// 	container.StartContainer(ctx, forwardPort)
	// }

	// Parse the origin URL
	// origin, _ := url.Parse(fmt.Sprintf("http://0.0.0.0:%d", forwardPort))
	origin, _ := url.Parse(fmt.Sprintf("http://0.0.0.0:%d", 44221))

	// Initialize the proxy
	proxy := httputil.NewSingleHostReverseProxy(origin)

	// Initialize the proxy
	proxy.ServeHTTP(w, r)
} 

func main() {
	// I also need to start the garbage container collection

	http.HandleFunc("/", proxyHandler)

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}