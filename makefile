# Declare the .env file to use
include .env.local
# include .env

# ---------- Main ----------

# Start containers in dev mode
dc-start-dev:
	export DOCKERHOST=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
	docker-compose -f docker-compose.dev.yml --env-file .env.local up

# Start and build the dev containers
dc-start-dev-build:
	export DOCKERHOST=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
	docker-compose -f docker-compose.dev.yml --env-file .env.local up --build

# Start containers in dev mode
dc-start-build:
	export DOCKERHOST=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
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

# # Start the dev app manager
# dev-appmanager:
# 	cd src/appmanager; nodemon --watch ../appmanager/ --ext '*' --signal SIGTERM --exec 'godotenv -f ../../.env go run main.go'

# # Start the dev app builder
# dev-appbuilder:
# 	ngrok http 3000 > /dev/null &
# 	sleep 1
# 	curl http://127.0.0.1:4040/api/tunnels
# 	dotenv run python3 /home/ben/Code/Markotplace/src/appbuilder/app.py 