#!/bin/bash

# Remove existing cluster
minikube delete

# Start Minikube cluster
minikube start --cpus 6 --memory 6144

# Add addons
minikube addons enable metrics-server
minikube addons enable ingress

# Deploy secrets
kubectl apply -f deployments/secrets/.secrets.yaml

# Deploy the application
kubectl apply -f deployments/products.yaml
kubectl apply -f deployments/orders.yaml
kubectl apply -f deployments/payments.yaml
kubectl apply -f deployments/carts.yaml
kubectl apply -f deployments/client-app.yaml
kubectl apply -f deployments/admin-app.yaml
kubectl apply -f deployments/keycloak.yaml

# Deploy databases
kubectl apply -f deployments/databases/products_db.yaml
kubectl apply -f deployments/databases/carts_db.yaml
kubectl apply -f deployments/databases/orders_db.yaml
kubectl apply -f deployments/databases/keycloak_db.yaml
kubectl apply -f deployments/databases/shipments_db.yaml

# Deploy kraken
kubectl apply -f deployments/overlays/ingress.yaml
kubectl apply -f deployments/kraken.yaml

# Deploy Monitoring
helm repo update
kubectl create namespace monitoring
helm install loki grafana/loki-stack --namespace monitoring -f deployments/values-loki.yaml
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install promstack prometheus-community/kube-prometheus-stack --namespace monitoring --version 57.0.1 -f deployments/values-monitoring.yaml

echo "All done!"
