include .env

# Startup Docker compose
start:
	docker-compose up -d

# Shutdown Docker compose
stop:
	docker-compose down

# -----------------------

kill:
	docker kill $$(docker ps -q)

dev-app-engine:
	cd src/appengine; nodemon --watch ../appengine/ --ext '*' --signal SIGTERM --exec 'go run main.go'

app-engine:
	docker build -t bengosborn/appengine src/appengine
	docker run -dp 4000:4000 -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker bengosborn/appengine