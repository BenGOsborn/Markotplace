#!/bin/bash

# Start Redis
docker run -dp 6379:6379 --name redis redis redis-server --requirepass ${REDIS_PASSWORD}

# Start PostgreSQL
docker run -dp 5432:5432 --name db -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} postgres