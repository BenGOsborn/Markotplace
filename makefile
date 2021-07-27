include .env

# ---------- Main ----------

# Build images and start them up
dc-start:
	docker-compose up --build

# Shutdown Docker Compose
dc-stop:
	docker-compose down

# Kill all Docker containers
docker-kill:
	docker rm -f $$(docker ps -q)

# Kill all instances of Ngrok
ngrok-kill:
	killall ngrok

# ---------- Dev ----------

# Start PostgreSQL
dev-db:
	docker run -p 5432:5432 --name db -d -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} postgres

# Access PostgreSQL db
dev-db-access:
	docker exec -it db psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# Start Redis
dev-redis:
	docker run -p 6379:6379 --name redis -d redis redis-server --requirepass ${REDIS_PASSWORD}

# Access Redis
dev-redis-access:
	docker exec -it redis redis-cli -a ${REDIS_PASSWORD}

# Start the dev app manager
dev-appmanager:
	cd src/appmanager; nodemon --watch ../appmanager/ --ext '*' --signal SIGTERM --exec 'godotenv -f ../../.env go run main.go'

# Start the dev app builder
dev-appbuilder:
	ngrok http 3000 > /dev/null &
	sleep 1
	curl http://localhost:4040/api/tunnels
	python3 /home/ben/Code/Markotplace/src/appbuilder/app.py 

# Start the dev api
dev-api:
	npm run --prefix src/api dev

# ---------- Run images ----------

# Build the app builder image and start it
appbuilder-start:
	docker build -t bengosborn/markotplace/appbuilder src/appbuilder
	docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker bengosborn/markotplace/appbuilder

# Build the app manager image and start it
appmanager-start:
	docker build -t bengosborn/markotplace/appmanager src/appmanager
	docker run -dp 5000:5000 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker bengosborn/markotplace/appmanager

# Build the API image and start it
api-start:
	docker build -t bengosborn/markotplace/api src/api
	docker run -dp 4000:4000 bengosborn/markotplace/api
