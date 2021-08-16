package handle

import (
	"apphandler/database"
	"apphandler/processes"
	"apphandler/utils"
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

const STATE_COOKIE = "appmanager.state.appname"

func ProxyHandle(route string, tracker *map[string]*processes.Tracker, db *database.DataBase) func(w http.ResponseWriter, r *http.Request) {
	// Return the handler that uses the specified params
	return func(w http.ResponseWriter, r *http.Request) {
		// Handle CORS

		// Parse the URL and get the app name
		if !strings.HasPrefix(r.URL.Path, route) {
			w.WriteHeader(400)
			return
		}
		r.URL.Path = r.URL.Path[len(route):]

		var appName string
		if len(r.URL.Path) > 0 {
			slashIndex := strings.Index(r.URL.Path, "/")
			if slashIndex == -1 {
				appName = r.URL.Path
				r.URL.Path = "/"
			} else {
				appName = r.URL.Path[:slashIndex]
				r.URL.Path = r.URL.Path[slashIndex:]
			}
		} else {
			w.WriteHeader(400)
			return
		}

		// Verify the authentication cookie and that the user owns the app
		sessionCookie, err := r.Cookie("connect.sid")
		if err != nil {
			w.WriteHeader(401)
			return
		}

		// Initialize the POST data
		jsonStr, _ := json.Marshal(map[string]string{"appName": appName})

		// Initialize the http client
		client := &http.Client{}

		// Initialize the request
		req, err := http.NewRequest("POST", "http://api:4000/api/apps/owns", bytes.NewBuffer(jsonStr))
		if err != nil {
			w.WriteHeader(500)
			return
		}
		req.Header.Set("Cookie", sessionCookie.String())
		req.Header.Set("Content-Type", "application/json")

		// Verify that the user owns the app
		resp, err := client.Do(req)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			w.WriteHeader(401)
			return
		}

		// Get the container
		uri, err := utils.GetRunningApp(appName, tracker, db)
		if err != nil {
			w.WriteHeader(500)
			return
		}

		// Proxy to the container
		remote, _ := url.Parse(uri)
		proxy := httputil.NewSingleHostReverseProxy(remote)

		// Retry system **** BAD
		proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, e error) {
			// Retry the proxy
			time.Sleep(3 * time.Second)
			proxy.ServeHTTP(w, r)
		}

		// Serve the proxy
		proxy.ServeHTTP(w, r)
	}
}
