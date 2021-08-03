package monitor

import (
	"fmt"
	"os"
)

func Monitor() {
	// Fetch the data from the database continuously for different apps, check the versions, and if different, rebuild them
	// https://www.calhoun.io/connecting-to-a-postgresql-database-with-gos-database-sql-package/

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", os.Getenv("POSTGRES_HOST"), os.Getenv("POSTGRES_HOST"), 5432, os.Getenv("POSTGRES_PASSWORD"), os.Getenv("POSTGRES_DB"))
}
