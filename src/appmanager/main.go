package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"appmanager/containerutils"
)

// Initialize default values
const PORT = 5000
const STATE_COOKIE = "appmanager.state.appname"

var containerPrefix = os.Getenv("CONTAINER_PREFIX")
var environment = os.Getenv("ENVIRONMENT")
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

	// Get the session cookie to forward
	sessionCookie, err := r.Cookie("connect.sid")
	if err != nil {
		w.WriteHeader(403)
		return
	}

	// Initialize the POST data
	jsonStr, _ := json.Marshal(map[string]string{"appName": appID})

	// Initialize the http client
	client := &http.Client{}

	// Initialize the request
	var apiURL string;
	if environment == "production" {
		apiURL = "http://api:4000/api/user/owns-app"
	} else {
		apiURL = "http://localhost:4000/api/user/owns-app"
	}
	req, _ := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonStr))
	req.Header.Set("Cookie", fmt.Sprintf("connect.sid=%s", sessionCookie))
	req.Header.Set("Content-Type", "application/json")

	// Make the request
	_, err = client.Do(req)
	if err != nil {
		w.WriteHeader(403)
		return
	}

	// Get the container
	container := containerutils.GetContainer(ctx, fmt.Sprintf("%s/%s", containerPrefix, appID), &containers)

	// Initialize the forward URL
	var forwardPort int

	// Start the container if it does not exist, otherwise get the port for the container and log a hit
	if !container.Active {
		forwardPort = containerutils.GetPort(&containers)
		if err := container.StartContainer(ctx, forwardPort); err != nil {
			w.WriteHeader(500)
			return
		}
	} else {
		forwardPort = container.Port
		container.LastHit = time.Now()
	}

	// Proxy pass to the correct route
	remote, _ := url.Parse(fmt.Sprintf("http://localhost:%d", forwardPort))
	proxy := httputil.NewSingleHostReverseProxy(remote)

	// Reset the requested path
	req.URL.Path = req.URL.Path[:len("/appmanager/reverse-proxy")]

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
	http.HandleFunc("/appmanager/reverse-proxy", proxyHandler)

	// Start the server and log error
	log.Println(fmt.Sprintf("App manager listening on port %d...", PORT))
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
