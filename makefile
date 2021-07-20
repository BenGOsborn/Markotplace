include .env

# ---------- Main ----------

# Startup Docker Compose
dc-run:
	docker-compose up -d

# Shutdown Docker Compose
dc-stop:
	docker-compose down

# Build Docker Compose images
dc-build:
	docker-compose build

# Build images and start them up
dc-start:
	docker-compose up --build

# Kill all Docker containers
d-kill:
	docker rm -f $$(docker ps -q)

# Export env variables from .env
env:
	export $$(cat .env)	

# ---------- Dev ----------

# Start the development application engine
dev-appengine:
	cd src/appengine; nodemon --watch ../appengine/ --ext '*' --signal SIGTERM --exec 'go run main.go'

# Start PostgreSQL
dev-db: env
	docker run -p 5432:5432 --name db -d -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -e POSTGRES_DB=${POSTGRES_DB} postgres

# Access PostgreSQL db
dev-db-access: env
	docker exec -it db psql -U ${POSTGRES_USER} ${POSTGRES_DB}

# Start Redis
dev-redis: env
	docker run -p 6379:6379 --name redis -d redis redis-server --requirepass ${REDIS_PASSWORD}

# Access Redis
dev-redis-access:
	docker exec -it redis redis-cli -a ${REDIS_PASSWORD}

# Start the auth service
dev-auth: env
	npm run --prefix src/auth dev

dev-auth-migrate: env
	npx prisma migrate dev --name init --schema src/auth/prisma/schema.prisma

# ---------- Run images ----------

# Build the app engine image and start it
appengine-start:
	docker build -t bengosborn/appengine src/appengine
	docker run -dp 4000:4000 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker bengosborn/appengine