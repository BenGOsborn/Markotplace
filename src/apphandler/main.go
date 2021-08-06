package main

import (
	"apphandler/database"
	"fmt"
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
	db, err := database.Connect()
	if err != nil {
		panic(err)
	}

	appName := "Test"
	row := db.QueryRow("SELECT app.name, app.ghRepoOwner, app.ghRepoName, app.ghRepoBranch, app.version, app.env, dev.ghAccessToken FROM apps LEFT JOIN dev ON app.devID = dev.id WHERE app.name=$1", appName)
	fmt.Println(row)

	// testAppData, err := db.GetApp("Test")
	// if err != nil {
	// 	fmt.Println(err)
	// }

	// fmt.Println(testAppData)

	// // Build the image
	// if err := docker.BuildImage(testAppData); err != nil {
	// 	panic(err)
	// }

}
