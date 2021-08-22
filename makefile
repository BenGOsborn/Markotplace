# Declare the .env file to use
include .env.local
# include .env

# ---------- Main ----------

# Start containers in dev mode
dc-start-dev:
	docker-compose -f docker-compose.dev.yml --env-file .env.local up

# Start and build the dev containers
dc-start-dev-build:
	docker-compose -f docker-compose.dev.yml --env-file .env.local up --build

# Start containers in dev mode
dc-start-build:
	docker-compose -f docker-compose.build.yml --env-file .env up --build

# Kill all Docker containers
docker-kill:
	docker rm -f $$(docker ps -q)

# ---------- Dev ----------

# Access db
dev-db-access:
	docker exec -it markotplace_db_1 psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# Access redis
dev-redis-access:
	docker exec -it markotplace_redis_1 redis-cli -a ${REDIS_PASSWORD}