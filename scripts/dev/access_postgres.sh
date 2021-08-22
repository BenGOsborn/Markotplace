#!/bin/bash

# Load env variables
source ./env/.env.dev

# Access postgres
docker exec -it markotplace_db_1 psql -U ${POSTGRES_USER} ${POSTGRES_DB}