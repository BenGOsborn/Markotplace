package database

import (
	"database/sql"
	"fmt"
	"os"
)

type DataBase struct {
	db *sql.DB
}

func (database *DataBase) Connect() {
	// Fetch the data from the database continuously for different apps, check the versions, and if different, rebuild them
	// https://www.calhoun.io/connecting-to-a-postgresql-database-with-gos-database-sql-package/

	// Connect to DB
	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", os.Getenv("POSTGRES_HOST"), 5432, os.Getenv("POSTGRES_USER"), os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"))
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		panic(err)
	}
	database.db = db
}

func (database *DataBase) Close() {
	// Close the connection to the database
	database.db.Close()
}
