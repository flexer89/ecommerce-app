#!/bin/bash

cd "$(dirname "$0")"

IMAGE_NAME="product-service"
CONTAINER_NAME="product-service"
DOCKERFILE_PATH="../Dockerfile"

docker build -t $IMAGE_NAME -f $DOCKERFILE_PATH ..
docker run -p 5000:5000 --name $CONTAINER_NAME $IMAGE_NAME
