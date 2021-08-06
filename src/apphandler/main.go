package main

import (
	"apphandler/database"
	"apphandler/docker"
)

// Initialize constant variables
const PORT = 5000

// Different parts of this system
// - Proxy
// - Container starter / redirecter
// - Container builder
// - App monitoring

func main() {
	// **** CORS will ALSO be required for this to function properly as cookies are required

	// Handle the main container redirect route
	// http.HandleFunc("/apphandler", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintf(w, "Hello world!")
	// })

	// // Start the server and log error
	// log.Println(fmt.Sprintf("Apphandler listening on port %d...", PORT))
	// log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", PORT), nil))

	// // Test data
	// testAppData := &database.AppData{
	// 	AppName:       "lol",
	// 	AppVersion:    1,
	// 	GhRepoOwner:   "BenGOsborn",
	// 	GhRepoName:    "Cerci",
	// 	GhRepoBranch:  "master",
	// 	GhAccessToken: "lol",
	// 	Env:           map[string]*string{},
	// }

	// Initialize the database
	db := new(database.DataBase)
	db.Connect()

	// Build the image
	if err := docker.BuildImage(testAppData); err != nil {
		panic(err)
	}

}
