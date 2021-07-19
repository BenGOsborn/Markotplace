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
kill:
	docker kill $$(docker ps -q)

# ---------- App engine ----------

ae-dev:
	cd src/appengine; nodemon --watch ../appengine/ --ext '*' --signal SIGTERM --exec 'go run main.go'

ae-start:
	docker build -t bengosborn/appengine src/appengine
	docker run -dp 4000:4000 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker bengosborn/appengine