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
	err := db.Connect()
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// Start the builder
	// processes.Builder(db)

	// Get the app
	row, err := db.GetApp("test")
	if err != nil {
		panic(err)
	}

	// Maybe there is a better way of accessing this ?
	// type Tracker struct {
	// 	AppData *database.AppData
	// 	LastAccessed time.Time
	// }
	// tMap := []Tracker{}

	// Start the container
	err = docker.StartContainer(row, 7777)
	if err != nil {
		panic(err)
	}

	// Get the container
	ctr, err := docker.GetRunningContainer(row)
	if err != nil {
		panic(err)
	}

	// Then maybe I can just have some sort of lookup table for the times each one was accessed ?

	// Stop the container
	err = docker.StopContainer(ctr)
	if err != nil {
		panic(err)
	}
}
