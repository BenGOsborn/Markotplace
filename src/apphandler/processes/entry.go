package processes

import (
	"apphandler/database"
	"apphandler/docker"
	"time"
)

const PROCESS_DELAY = 20 * time.Second

type Tracker struct {
	AppData      *database.AppData
	LastAccessed time.Time
}

func (tracker *Tracker) ResetTimer() {
	tracker.LastAccessed = time.Now()
}

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

		// Pause before restarting - adjust the time on this
		time.Sleep(PROCESS_DELAY)
	}
}

func Cleaner(tracker *map[string]*Tracker) {
	// Maybe it should force close processes out of its scope as well such as processes that start with the prefix and have no record of existing ?
	for {
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

		// Sleep before restarting
		time.Sleep(PROCESS_DELAY)
	}
}

// **** System cleanup function for removing old containers ?

func Stop() {
	// Stops unused containers
}
