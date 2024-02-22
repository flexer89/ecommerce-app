#!/bin/bash

# Stop the cluster
echo "Stopping the cluster..."

# Add your cluster stop command here
minikube stop
tilt down

echo "Cluster stopped successfully."
