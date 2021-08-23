#!/bin/bash

while getopts ":bn" option; do
    case $option in
        b)
            # Build the containers and start them
            docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production up --build
            exit;;
    esac 
done

# Start the containers
docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production up