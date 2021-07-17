include .env

# Startup Docker compose
start:
	docker-compose up -d

# Shutdown Docker compose
stop:
	docker-compose down

# -----------------------

app-engine-dev:
	cd src/appEngine; go run .

app-engine:
	docker build -t bengosborn/test src/appEngine
	docker run -dp 3000:3000 bengosborn/test