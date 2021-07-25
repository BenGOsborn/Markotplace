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
const STATE_COOKIE = "ctr.state.appname"

var ctx context.Context = context.Background()
var containers = []containerutils.Container{}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// I also need some level of authentication and app checking here too
	// How can I make admin verified state transfer ? (maybe I can have some type of admin password which gets shared between states via server secret ?)

	var appID string

	// Get the AppID from the query or the state cookie
	appIDs, ok := r.URL.Query()["appID"]
	if !ok {
		// Get the state cookie
		stateCookie, err := r.Cookie(STATE_COOKIE)
		if err != nil {
			w.WriteHeader(400)
			return
		} else {
			appID = stateCookie.Value
		}
	} else {
		appID = appIDs[0]
	}

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

	// // Start the container if it does not exist, otherwise get the port for the container and log a hit
	// if !container.Active {
	// 	forwardPort = containerutils.GetPort()
	// 	if err := container.StartContainer(ctx, forwardPort); err != nil {
	// 		w.WriteHeader(500)
	// 		return
	// 	}
	// } else {
	// 	forwardPort = container.Port
	// 	container.LastHit = time.Now()
	// }

	// Proxy pass to the correct route
	remote, _ := url.Parse(fmt.Sprintf("http://0.0.0.0:%d", 3000))
	proxy := httputil.NewSingleHostReverseProxy(remote)

	// Set a cookie for maintaining the container connection
	proxy.ModifyResponse = func(r *http.Response) error {
		r.Header.Set("Set-Cookie", fmt.Sprintf("%s=%s", STATE_COOKIE, appID))
		return nil
	}

	// Serve the proxy
	proxy.ServeHTTP(w, r)
}

func main() {
	// Start the container cleanup process
	go containerutils.CleanupContainers(ctx, &containers)

	// Handle the main container redirect route
	http.HandleFunc("/", proxyHandler)

	// Start the server and log error
	log.Println(fmt.Sprintf("App engine listening on port %d...", PORT))
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
