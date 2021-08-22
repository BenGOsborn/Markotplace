#!/bin/bash

while getopts ":b" option; do
    case $option in
        b)
            # Build the containers and start them
            docker-compose -f ../../docker-compose/docker-compose.dev.yml --env-file ../../env/.env.dev up --build
            exit;;
    esac 
done

# Start the containers
docker-compose -f ../../docker-compose/docker-compose.dev.yml --env-file ../../env/.env.dev up