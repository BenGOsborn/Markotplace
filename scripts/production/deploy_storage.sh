#!/bin/bash

# Create the data directories if they don't exist
mkdir -p data/redis
mkdir -p data/postgres

# Start storage services
docker-compose -f docker-compose/docker-compose.storage.yml --env-file env/.env.production up