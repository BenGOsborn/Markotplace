# .env environments
include .env.local
# include .env

# ---------- Main ----------

# Start containers in dev mode
dc-start-dev:
	docker-compose --env-file .env.local up --build

# Shutdown containers
dc-stop:
	docker-compose down

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

# # Start the dev app manager
# dev-appmanager:
# 	cd src/appmanager; nodemon --watch ../appmanager/ --ext '*' --signal SIGTERM --exec 'godotenv -f ../../.env go run main.go'

# # Start the dev app builder
# dev-appbuilder:
# 	ngrok http 3000 > /dev/null &
# 	sleep 1
# 	curl http://localhost:4040/api/tunnels
# 	dotenv run python3 /home/ben/Code/Markotplace/src/appbuilder/app.py 