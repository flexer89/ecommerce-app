#!/bin/bash

cd "$(dirname "$0")"

CONTAINER_NAME="carts-service"

docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
