include ./env/.env.dev

# ---------- Dev ----------

# Access db
dev-db-access:
	docker exec -it markotplace_db_1 psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# Access redis
dev-redis-access:
	docker exec -it markotplace_redis_1 redis-cli -a ${REDIS_PASSWORD}