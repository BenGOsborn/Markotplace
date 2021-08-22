#!/bin/bash

# Load env variables
source ../../env/.env.dev

# Access redis
docker exec -it markotplace_redis_1 redis-cli -a ${REDIS_PASSWORD}