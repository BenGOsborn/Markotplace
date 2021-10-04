docker-compose -f docker-compose/docker-compose.production.yml --env-file env/.env.production down
docker-compose -f docker-compose/docker-compose.storage.yml --env-file env/.env.production down