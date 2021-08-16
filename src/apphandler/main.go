package main

import (
	"apphandler/database"
	"apphandler/docker"
	"apphandler/handle"
	"apphandler/processes"
	"apphandler/utils"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
)

func Test() {
	// Initialize the database
	db := new(database.DataBase)
	err := db.Connect()
	if err != nil {
		panic(err)
	}
	defer db.Close()

	// Start the builder
	// processes.Builder(db)

	// Test app name
	const APPNAME = "test"

	// Get the app
	row, err := db.GetApp(APPNAME)
	if err != nil {
		panic(err)
	}

	// Build the image
	err = docker.BuildImage(row)
	if err != nil {
		panic(err)
	}

	// Create a way of tracking the variables
	tracker := map[string]*processes.Tracker{}

	uri, err := utils.GetRunningApp(APPNAME, &tracker, db)
	if err != nil {
		panic(err)
	}
	fmt.Printf("URI of container: %s\n", uri)

	// Get the container
	ctr, err := docker.GetRunningContainer(row)
	if err != nil {
		panic(err)
	}

	// Stop the container
	err = docker.StopContainer(ctr)
	if err != nil {
		panic(err)
	}
}

func main() {
	// Initialize the port
	port, err := strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		port = 5000
	}

	// Initialize the database and tracker

	// Initialize the database
	db := new(database.DataBase)
	if err := db.Connect(); err != nil {
		panic(err)
	}
	defer db.Close()

	// Initialize the tracker
	tracker := map[string]*processes.Tracker{}

	// Initialize the processes
	go processes.Builder(db)
	go processes.Stop(&tracker)
	// I also need one for the cleaner eventually

	// Start the proxy handler
	const proxyRoute = "/apphandler/"
	http.HandleFunc(proxyRoute, handle.ProxyHandle(proxyRoute, &tracker, db))

	// Start the server
	log.Println(fmt.Sprintf("Apphandler listening on port %d...", port))
	log.Fatalln(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}
