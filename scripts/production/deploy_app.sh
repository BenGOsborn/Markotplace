#!/bin/bash

# Create the data directories if they don't exist
mkdir -p data/certbot

while getopts ":bn" option; do
    case $option in
        b)
            # Build the containers and start them
            docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production up --build -d
            exit;;
    esac 
done

# Start the containers
docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production up -d