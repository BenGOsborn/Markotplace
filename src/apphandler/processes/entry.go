package processes

import (
	"apphandler/database"
	"apphandler/docker"
)

func Builder(db *database.DataBase) {
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
		if _, ok := existingImages[imageName]; ok {
			go docker.BuildImage(&appData)
		}
	}
}

func Cleaner() {
	// Deletes the apps on the system no longer used by the database
}

func Stop() {
	// Stops unused containers
}
