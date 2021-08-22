#!/bin/bash

# Start the dev Docker Compose for the app
docker-compose -f ./docker-compose/docker-compose.dev.yml --env-file ./env/.env.dev up