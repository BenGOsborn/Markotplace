#!/bin/bash

# How to load env variables into the script ?
docker run -dp 6379:6379 --name redis redis redis-server --requirepass ${REDIS_PASSWORD}