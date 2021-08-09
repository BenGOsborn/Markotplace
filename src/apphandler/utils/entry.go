package utils

import (
	"apphandler/database"
	"apphandler/docker"
	"apphandler/processes"
	"crypto/rand"
	"fmt"
	"net"
	"time"
)

func GetRunningApp(appName string, tracker *map[string]*processes.Tracker, db *database.DataBase) (string, error) {
	// Try and get the container that matches the app name
	trackerData, ok := (*tracker)[appName]
	if ok {
		// Reset the timer
		trackerData.ResetTimer()

		// Return the URI of the app
		return fmt.Sprintf("http://0.0.0.0:%d", trackerData.Port), nil
	} else {
		// Find the app data that matches the app name
		appData, err := db.GetApp(appName)
		if err != nil {
			return "", err
		}

		// Try and build the new container
		// **** What is the point of some of those other containers ?
		port := 3000 // **** Generate a port from scratch
		err = docker.StartContainer(appData, port)
		if err != nil {
			return "", err
		}
		(*tracker)[appName] = &processes.Tracker{Port: port, AppData: appData, LastAccessed: time.Now()}

		// Return the URI of the app
		return fmt.Sprintf("http://0.0.0.0:%d", port), nil
	}
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
