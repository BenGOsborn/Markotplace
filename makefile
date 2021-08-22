# ---------- Main ----------

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