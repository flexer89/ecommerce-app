#!/bin/bash

cd "$(dirname "$0")"

IMAGE_NAME="carts-service"
CONTAINER_NAME="carts-service"
DOCKERFILE_PATH="../Dockerfile"

docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH ..
docker run -p 5040:5040 --name $CONTAINER_NAME $IMAGE_NAME
