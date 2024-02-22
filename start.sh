#!/bin/bash

# Start the cluster
echo "Starting the cluster..."

# Add your cluster startup commands here
minikube start
tilt up

echo "Cluster started successfully!"
