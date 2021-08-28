#!/bin/bash

# Start the containers
docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production up --build -d