#!/bin/bash

# Start the production Docker Compose for the app

while getopts ":b" option; do
    case $option in
        b)
            # Build the containers
            docker-compose -f ./docker-compose/docker-compose.production.yml --env-file ./env/.env.production up --build
            exit;;
    esac 
done

# Start the containers
docker-compose -f ./docker-compose/docker-compose.production.yml --env-file ./env/.env.production up