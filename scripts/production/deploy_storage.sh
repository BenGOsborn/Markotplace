#!/bin/bash

# Create the data directories if they don't exist
mkdir -p ./data/redis
mkdir -p ./data/postgres

# Start Redis
docker run -dp 6379:6379 -v ./data/redis:/data --name redis redis redis-server --requirepass ${REDIS_PASSWORD}

# Start PostgreSQL
docker run -dp 5432:5432 -v ./data/postgres:/data --name postgres -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} postgres