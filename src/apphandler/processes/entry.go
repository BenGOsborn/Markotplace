package processes

import (
	"apphandler/database"
)

func Builder(database *database.DataBase) error {
	// Compares the apps in the database and the apps on the system and builds the new ones
	// validApps, err := database.GetApps()
	// if err != nil {
	// 	panic(err)
	// }

	// Maybe it makes more sense to leave them in their string form then use them as a lookup table ?

	// Get the list of existing docker images
	// existingImageNames, err := docker.ListImages()
	// if err != nil {
	// 	panic(err)
	// }
	// existingImageData := map[string]docker.ImageData{}
	// for _, imageName := range *existingImageNames {
	// 	imageData, err := docker.ParseImageName(imageName)
	// 	if err != nil {
	// 		continue
	// 	}
	// 	existingImageData[] = append(existingImageData, *imageData)
	// }

	// fmt.Println(validApps)
	// fmt.Println(existingImageData)

	// A better solution would be to make a map out of this existing image data to reduce the time complexity

	// for _, appData := range *validApps {
	// 	exists := false
	// 	for _, imageData := range existingImageData {

	// 	}
	// }

	// Return no errors
	return nil
}

func Cleaner() {
	// Deletes the apps on the system no longer used by the database
}

func Stop() {
	// Stops unused containers
}
