#!/bin/bash

cd "$(dirname "$0")"

IMAGE_NAME="payments-service-unit-tests"
CONTAINER_NAME="payments-service-unit-tests"
DOCKERFILE_PATH="../tests/Dockerfile"

docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH ..
docker run --rm --name $CONTAINER_NAME $IMAGE_NAME
