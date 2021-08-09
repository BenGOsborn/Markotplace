package utils

import (
	"apphandler/database"
	"apphandler/docker"
	"apphandler/processes"
	"crypto/rand"
	"fmt"
	"net"
)

func GetRunningApp(appName string, tracker *map[string]*processes.Tracker, db *database.DataBase) (string, error) {
	// Declare the appdata
	var appData *database.AppData

	// Try and get the container that matches the app name
	trackerData, ok := (*tracker)[appName]
	if ok {
		appData = trackerData.AppData
	} else {
		tempAppData, err := db.GetApp(appName)
		if err != nil {
			return "", err
		}
		appData = tempAppData
	}

	// Attempt to get the running container
	ctr, err := docker.GetRunningContainer(appData)
	if err != nil {
		// Attempt to start the container
		port := 3000
		err = docker.StartContainer(appData, port)
		// **** ADD THE CONTAINER TO THE TRACKER LIST + ADD THE PORT
		if err != nil {
			return "", err
		}

		// Return the URI of the container
		return fmt.Sprintf("http://0.0.0.0:%d", port), nil
	}

	// Return the URI of the container
	return fmt.Sprintf("http://0.0.0.0:%d", ctr.Ports[0].PublicPort), nil
}

// Specify a new way to exlcude known used containers
func GetPort(tracker *map[string]*processes.Tracker) (int, error) {
	// Specify the valid port range
	portMin := 2000
	portMax := 65535

	// Get a sorted list of existing ports within the valid port range
	badPorts := []int{}
	for key, value := range *tracker {
		// I need some way of getting the ports from the running processes too ?
	}
	// sort.Ints(badPorts)

	// Generate a random port until it is correct
	for {
		// Generate a new random port within the range
		randPort := portMin + rand.Int()%(portMax-portMin+1)

		// Make sure that the port is not in the list of existing ports
		for _, existingPort := range existingPorts {
			if randPort < existingPort {
				break
			}
			randPort++
		}

		// Check that the port is not used by the rest of the system
		server, err := net.Listen("tcp", fmt.Sprintf(":%d", randPort))

		// If the server connected to the port it must be valid, so return it, otherwise continue
		if err == nil {
			server.Close()
			return randPort
		}
	}
}
