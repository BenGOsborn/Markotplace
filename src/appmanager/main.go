package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	"appmanager/containerutils"
)

// Initialize default values
const PORT = 4000
const STATE_COOKIE = "appmanager.state.appname"
const SITE_URL = "http://0.0.0.0:4000"

var ctx context.Context = context.Background()
var containers = []containerutils.Container{}

func proxyHandler(w http.ResponseWriter, r *http.Request) {
	// Initialize the string
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

	// Check if the user owns the app
	res, err := http.Get(fmt.Sprintf("%s/api/user/data", SITE_URL))
	if err != nil {
		w.WriteHeader(403)
		return
	}

	// Parse the body
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	// I need to get the JSON from this

	// Check that the app is indeed valid and that the user is authenticated here to access the app

	// **** Instead of accessing the container by their name directly it has to interact via the specified name
	// **** Maybe instead of storing the names of containers and their ID's, we should store them by their names ??? (this could also be more of a mess but check it out)

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
	log.Println(fmt.Sprintf("App manager listening on port %d...", PORT))
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
