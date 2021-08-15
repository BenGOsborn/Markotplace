package utils

import (
	"apphandler/database"
	"apphandler/docker"
	"apphandler/processes"
	"errors"
	"fmt"
	"math/rand"
	"net"
	"sort"
	"time"
)

func GetRunningApp(appName string, tracker *map[string]*processes.Tracker, db *database.DataBase) (string, error) {
	// Try and get the container that matches the app name
	trackerData, ok := (*tracker)[appName]
	if ok {
		// Reset the timer
		trackerData.ResetTimer()

		// Return the URI of the app
		return fmt.Sprintf("http://localhost:%d", trackerData.Port), nil
	} else {
		// Find the app data that matches the app name
		appData, err := db.GetApp(appName)
		if err != nil {
			return "", err
		}

		// Try and build the new container
		port, err := GetPort(tracker)
		if err != nil {
			return "", err
		}
		err = docker.StartContainer(appData, port)
		if err != nil {
			return "", err
		}
		(*tracker)[appName] = &processes.Tracker{Port: port, AppData: appData, LastAccessed: time.Now()}

		// Return the URI of the app
		return fmt.Sprintf("http://localhost:%d", port), nil
	}
}

// Specify a new way to exlcude known used containers
func GetPort(tracker *map[string]*processes.Tracker) (int, error) {
	// Specify the valid port range
	portMin := 2000
	portMax := 65535

	// Get a list of existing ports within the valid port range
	badPorts := []int{}
	for _, value := range *tracker {
		badPorts = append(badPorts, value.Port)
	}

	// Generate a random port until it is correct
	for {
		// Generate a new random port within the range
		randPort := portMin + rand.Int()%(portMax-portMin+1)

		// Make sure that the port is not in the list of existing ports
		sort.Ints(badPorts)
		for _, existingPort := range badPorts {
			if randPort < existingPort {
				break
			}
			randPort++

			// Check if out of ports
			if randPort > portMax {
				return -1, errors.New("no valid ports")
			}
		}

		// Check that the port is not used by the rest of the system
		server, err := net.Listen("tcp", fmt.Sprintf(":%d", randPort))

		// If the server connected to the port it must be valid, so return it, otherwise continue
		if err == nil {
			server.Close()
			return randPort, nil
		} else {
			badPorts = append(badPorts, randPort)
		}
	}
}
