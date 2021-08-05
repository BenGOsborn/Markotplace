package database

import (
	"database/sql"
	"fmt"
	"os"
)

type AppData struct {
	AppName       string
	GhRepoOwner   string
	GhRepoName    string
	GhRepoBranch  string
	AppVersion    int
	Env           string
	GhAccessToken string
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

func (database *DataBase) GetApps() ([]AppData, error) {
	// Get a list of apps from the database
	rows, err := database.db.Query("SELECT app.name, app.ghRepoOwner, app.ghRepoName, app.ghRepoBranch, app.version, app.env, dev.ghAccessToken FROM app LEFT JOIN dev ON app.devID = dev.id")
	if err != nil {
		return nil, err
	}

	// To store the data in
	returnData := []AppData{}

	for rows.Next() {
		// Read the data from the rows
		appData := new(AppData)
		err := rows.Scan(appData.AppName, appData.GhRepoOwner, appData.GhRepoName, appData.GhRepoBranch, appData.AppVersion, appData.Env, appData.GhAccessToken)
		if err != nil {
			return nil, err
		}
		returnData = append(returnData, *appData)
	}

	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Return the data
	return returnData, nil
}

func (database *DataBase) GetApp(appName string) (*AppData, error) {
	// Get the row from the database
	row := database.db.QueryRow("SELECT app.name, app.ghRepoOwner, app.ghRepoName, app.ghRepoBranch, app.version, app.env, dev.ghAccessToken FROM apps LEFT JOIN dev ON app.devID = dev.id WHERE app.name=$1", appName)
	appData := new(AppData)
	if err := row.Scan(appData.AppName, appData.GhRepoOwner, appData.GhRepoName, appData.GhRepoBranch, appData.AppVersion, appData.Env, appData.GhAccessToken); err != nil {
		return nil, err
	}
	return appData, nil
}

func (database *DataBase) Close() error {
	// Close the connection to the database
	err := database.db.Close()
	if err != nil {
		return err
	}
	return nil
}
