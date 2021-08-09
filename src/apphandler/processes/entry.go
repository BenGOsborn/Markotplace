package processes

import (
	"apphandler/database"
	"apphandler/docker"
	"time"
)

type Tracker struct {
	AppData      *database.AppData
	Port         int
	LastAccessed time.Time
}

func (tracker *Tracker) ResetTimer() {
	tracker.LastAccessed = time.Now()
}

const PROCESS_DELAY = 20 * time.Second

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

func Cleaner() {
	// System cleanup function for removing old containers AND shutting down untracked containers spun up by this service
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

		// Sleep before restarting
		time.Sleep(PROCESS_DELAY)
	}
}
