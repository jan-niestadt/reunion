
# Config variables
#----------------------------------------

# Our project name. This is important if our project directory has a different name,
# such as when calling from Jenkins. In that case, the --project-name option will automatically
# be added.
PROJECT_NAME = reunion

# Name prefix for the Docker image(s)
IMAGE_NAME = instituutnederlandsetaal/reunion


# Helper variables
#-------------------------------------------

# Phony targets don't refer to a file, but are always executed when called.
.PHONY: \
  opt-project-name \
  setup \
  down \
  build \
  push \
  release \
  pull \
  stop \
  up \
  dev \
  logs \
  logs-f \
  deploy \
  update-dws

# Helper to be able to have leading whitespace in variable...
EMPTY_STRING =

CURRENT_DIR = $(shell basename $(PWD))

# See if our directory name matches our project name.
# If not, pass --project-name to Compose so it always behaves the same way.
# (if we didn't do this, container names would vary based on the directory name)
opt-project-name:
ifneq ($(PROJECT_NAME),$(CURRENT_DIR))
  OPT_PROJECT_NAME = $(EMPTY_STRING) --project-name $(PROJECT_NAME)
endif
-include opt-project-name

# Pass CONTEXT=<name> to use that Docker context
ifdef CONTEXT
  CONTEXT_PARAM = $(EMPTY_STRING) --context $(CONTEXT)
endif

# Our standard commands for calling Docker and Compose
DOCKER_COMMAND  = docker$(CONTEXT_PARAM)
COMPOSE_NO_FILE = docker compose$(CONTEXT_PARAM)$(OPT_PROJECT_NAME)
COMPOSE_COMMAND      = $(COMPOSE_NO_FILE) -f docker-compose.yml
COMPOSE_COMMAND_DEV  = $(COMPOSE_NO_FILE)
COMPOSE_COMMAND_TEST = $(COMPOSE_NO_FILE) -f docker-compose.yml -f docker-compose.testserver.yml


# APP_VERSION defined in our .env file (for tagging)
APP_VERSION := $$(grep APP_VERSION .env | cut -d "=" -f 2)

# Short hash of latest Git commit
GIT_COMMIT_HASH := $$(git log -1 --pretty=%h)

# Tag comprised of APP_VERSION and short hash of latest Git commit
GIT_COMMIT_TAG := $(APP_VERSION)-$(GIT_COMMIT_HASH)


# Application management targets
#-------------------------------------------

show-info:
	echo Git commit tag: $(GIT_COMMIT_TAG)
	echo current dir name: $(CURRENT_DIR)
	echo OPT_PROJECT_NAME:$(OPT_PROJECT_NAME)

# Stop application and remove containers
down:
	$(COMPOSE_COMMAND) down

# Build images
build:
	$(COMPOSE_COMMAND) build

# Build images (plain output for CI)
build-plain:
	$(COMPOSE_COMMAND) build --progress plain

# Tag images with version plus most recent git commit tag
commit-tag:
	$(DOCKER_COMMAND) tag $(IMAGE_NAME):$(APP_VERSION)   $(IMAGE_NAME):$(GIT_COMMIT_TAG)

# Push images to Docker Hub
push:
	$(COMPOSE_COMMAND) push

# Build images and push them to Docker Hub
release: build push
	:

# Pull images from Docker Hub
pull:
	$(COMPOSE_COMMAND) pull

# Stop application
stop:
	$(COMPOSE_COMMAND) stop

# Run application with local dev config
# (will build images only if missing)
dev:
	$(COMPOSE_COMMAND_DEV) up -d

# Restart application
restart:
	$(COMPOSE_COMMAND) restart

# Show application logs
logs:
	$(COMPOSE_COMMAND) logs

# Show and follow application logs
# (Ctrl+C to exit)
logs-f:
	$(COMPOSE_COMMAND) logs -f

# Start application with test config
testserver:
	$(COMPOSE_COMMAND_TEST) up -d

# Deploy application to server (based on images from Docker Hub) with production config
# by pulling the newest versions of images, then using them to bring the application up
deploy: pull
	$(COMPOSE_COMMAND) up -d --no-build

update-dws:
	$(COMPOSE_COMMAND) run --rm update-dws


# Shell into container
#---------------------------------------------------------------------

# Open a shell in the backend container
shell-api:
	$(COMPOSE_COMMAND) exec api sh
