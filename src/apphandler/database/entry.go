package database

import (
	"database/sql"
	"fmt"
	"os"
)

type AppData struct {
	ghRepoOwner  string
	ghRepoName   string
	ghRepoBranch string
	version      int
	name         string
}

// Maybe instead of a custom struct, simply just extend the original *sql.DB with these functions
type DataBase struct {
	db *sql.DB
}

func (database *DataBase) Connect() error {
	// Fetch the data from the database continuously for different apps, check the versions, and if different, rebuild them
	// https://www.calhoun.io/connecting-to-a-postgresql-database-with-gos-database-sql-package/

	// Connect to DB
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", os.Getenv("POSTGRES_HOST"), 5432, os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"))
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return err
	}
	database.db = db
	return nil
}

func (database *DataBase) GetApps(existingApps []string) ([]AppData, error) {
	// Get a list of apps from the database
	rows, err := database.db.Query("SELECT name, ghRepoOwner, ghRepoName, ghRepoBranch, version FROM apps")
	if err != nil {
		return nil, err
	}

	// To store the data in
	returnData := []AppData{}

	for rows.Next() {
		// Read the data from the rows
		appData := new(AppData)
		err = rows.Scan(appData.name, appData.ghRepoOwner, appData.ghRepoName, appData.ghRepoBranch, appData.version)
		if err != nil {
			return nil, err
		}
		returnData = append(returnData, *appData)
	}

	// Check for errors during iteration
	err = rows.Err()
	if err != nil {
		return nil, err
	}

	// Return the data
	return returnData, nil
}

func (database *DataBase) GetApp(appName string) (AppData, error) {
	// Get the row from the database
	row := database.db.QueryRow("SELECT name, ghRepoOwner, ghRepoName, ghRepoBranch, version FROM apps WHERE name=$1", appName)
	appData := new(AppData)
	if err := row.Scan(appData.name, appData.ghRepoOwner, appData.ghRepoName, appData.ghRepoBranch, appData.version); err != nil {
		return *appData, err
	}
	return *appData, nil
}

func (database *DataBase) Close() error {
	// Close the connection to the database
	err := database.db.Close()
	if err != nil {
		return err
	}
	return nil
}
