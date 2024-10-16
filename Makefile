DOCKER_COMPOSE=docker-compose
DOCKER_COMPOSE_FILE=compose.yml
.PHONY: up
up:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up --build  -d
.PHONY: down
down:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down
.PHONY: restart
restart: down up
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f
.PHONY: goose-up
goose-up:
	goose -dir backend/src/migration postgres "user=myuser password=mypassword dbname=mydatabase host=localhost port=5432 sslmode=disable" up