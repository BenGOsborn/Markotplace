include .env

# Start Docker compose
start:
	docker-compose up -d

stop:
	docker-compose down