#!/bin/bash

# Start the cluster
echo "Starting the cluster..."

# Add your cluster startup commands here
minikube start --cpus 6 --memory 6144
tilt up

echo "Cluster started successfully!"
