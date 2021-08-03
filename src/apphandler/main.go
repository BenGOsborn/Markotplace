package main

import (
	"fmt"
	"log"
	"net/http"
)

const PORT = 5000

func main() {
	// **** CORS will ALSO be required for this to function properly

	// Handle the main container redirect route
	http.HandleFunc("/appmanager/reverse-proxy", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello world!")
	})

	// Start the server and log error
	log.Println(fmt.Sprintf("App manager listening on port %d...", PORT))
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}
