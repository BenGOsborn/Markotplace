#!/bin/bash

# Load env variables
source env/.env.dev

# Access postgres
docker exec -it docker-compose_db_1 psql -U ${POSTGRES_USER} ${POSTGRES_DB}