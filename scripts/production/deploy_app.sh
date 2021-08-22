#!/bin/bash

# Start the production Docker Compose for the app
docker-compose -f ./docker-compose/docker-compose.production.yml --env-file ./env/.env.production up