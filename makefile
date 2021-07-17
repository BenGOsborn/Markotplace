include .env

# Startup Docker compose
start:
	docker-compose up -d

# Shutdown Docker compose
stop:
	docker-compose down