package processes

import (
	"apphandler/database"
	"apphandler/docker"
	"context"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

type Tracker struct {
	AppData      *database.AppData
	Port         int
	LastAccessed time.Time
}

func (tracker *Tracker) ResetTimer() {
	tracker.LastAccessed = time.Now()
}

const PROCESS_DELAY = 5 * time.Minute

func Builder(db *database.DataBase) {
	for {
		// Get a list of valid apps
		validApps, err := db.GetApps()
		if err != nil {
			panic(err)
		}

		// Get a map of the systems existing built images
		existingImageNames, err := docker.ListImages()
		if err != nil {
			panic(err)
		}
		existingImages := map[string]interface{}{}
		for _, existingImageName := range *existingImageNames {
			existingImages[existingImageName] = nil
		}

		// Compare the valid images and the existing images and build the new ones
		for _, appData := range *validApps {
			imageName := docker.BuildImageName(&appData)
			if _, ok := existingImages[imageName]; !ok {
				docker.BuildImage(&appData)
			}
		}

		// Pause before restarting
		time.Sleep(PROCESS_DELAY)
	}
}

func Cleaner(tracker *map[string]*Tracker) {
	for {
		// Initialize Docker client
		cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
		if err != nil {
			panic(err)
		}

		// Get a list of running containers
		containers, err := cli.ContainerList(context.TODO(), types.ContainerListOptions{})
		if err != nil {
			panic(err)
		}

		// Cache the names of the tracked containers
		trackedContainers := map[string]interface{}{}
		for _, tracked := range *tracker {
			imageName := docker.BuildImageName(tracked.AppData)
			trackedContainers[imageName] = nil
		}

		// Check that the services made by this container are all tracked
		for _, container := range containers {
			// Check that contains image is attached to this service
			containerImage := container.Image
			_, err := docker.ParseImageName(containerImage)
			if err != nil {
				continue
			}

			// Check if the container is being tracked - if it is not then stop it
			_, ok := trackedContainers[containerImage]
			if !ok {
				docker.StopContainer(&container)
			}
		}

		// Pause before restarting
		time.Sleep(PROCESS_DELAY)
	}
}

func Stop(tracker *map[string]*Tracker) {
	for {
		// Check for controller containers that havent been used recently
		for key, value := range *tracker {
			// If the container has not been accessed recently
			if time.Now().After(value.LastAccessed.Add(20 * time.Minute)) {
				// Get the container
				ctr, err := docker.GetRunningContainer(value.AppData)
				if err != nil {
					continue
				}

				// Stop the container and delete it from the list
				docker.StopContainer(ctr)
				delete(*tracker, key)
			}
		}

		// Pause before restarting
		time.Sleep(PROCESS_DELAY)
	}
}
