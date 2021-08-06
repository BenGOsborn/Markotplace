package processes

import "apphandler/database"

func Builder(database *database.DataBase) {
	// Compares the apps in the database and the apps on the system and builds the new ones

}

func Cleaner() {
	// Deletes the apps on the system no longer used by the database
}

func Stop() {
	// Stops unused containers
}
