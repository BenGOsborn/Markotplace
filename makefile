include .env

# Startup Docker compose
start:
	docker-compose up -d

# Shutdown Docker compose
stop:
	docker-compose down

# -----------------------

test-run:
	docker build -t bengosborn/test src/appEngine
	docker run -d bengosborn/test
	docker ps