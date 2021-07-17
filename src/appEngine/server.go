package main

import (
	"fmt"
	"log"
	"net/http"
)

// Initialize default values
const PORT = 4000

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Index")
		log.Println("Server ", PORT)
	})

	// Start the server and log error
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))
}