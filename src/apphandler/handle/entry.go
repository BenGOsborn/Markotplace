package handle

import (
	"apphandler/database"
	"apphandler/processes"
	"apphandler/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"time"
)

const STATE_COOKIE = "appmanager.state.appname"

func ProxyHandle(route string, tracker *map[string]*processes.Tracker, db *database.DataBase) func(w http.ResponseWriter, r *http.Request) {
	// Return the handler that uses the specified params
	return func(w http.ResponseWriter, r *http.Request) {
		// Handle CORS

		// Parse the URL
		r.URL.Path = r.URL.Path[len(route):]
		// paths = r.URL.Path // Now I need to get the following route from it and check it out (make sure it has the right amount of slashes)

		// Get the app name from the query OR from the cookie and then set the cookie back if not exists
		var appName string
		appNames, ok := r.URL.Query()["appName"] // Now, we are going to cut the first part of the URL out as the appname, and then cut the following out ? (maybe I dont need the state cookie)
		if !ok {
			// Get the state cookie
			stateCookie, err := r.Cookie(STATE_COOKIE)
			if err != nil {
				w.WriteHeader(400)
				return
			} else {
				appName = stateCookie.Value
			}
		} else {
			appName = appNames[0]
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
		time.Sleep(5 * time.Second) // This seens necessary?
		remote, _ := url.Parse(uri)
		proxy := httputil.NewSingleHostReverseProxy(remote)

		// Set a cookie for maintaining the container connection
		proxy.ModifyResponse = func(r *http.Response) error {
			r.Header.Set("Set-Cookie", fmt.Sprintf("%s=%s", STATE_COOKIE, appName))
			return nil
		}

		// Serve the proxy
		proxy.ServeHTTP(w, r)
	}
}
