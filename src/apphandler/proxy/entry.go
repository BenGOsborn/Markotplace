package proxy

import "net/http"

func ProxyHandle(w http.ResponseWriter, r *http.Request) {
	// Handle CORS

	// Get the app name from the query OR from the cookie and then set the cookie back if not exists

	// Verify the authentication cookie and that the user owns the app

	// Proxy to the container
}
