#!/bin/bash

# Remove existing cluster
minikube delete

# Start Minikube cluster
minikube start

# Add addons
minikube addons enable metrics-server

# Deploy kong
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.0.0/standard-install.yaml
kubectl apply -f deployments/kong-gateway.yaml
helm repo add kong https://charts.konghq.com
helm repo update
helm install kong kong/ingress -n kong --create-namespace

# Deploy the application
kubectl apply -f deployments/products.yaml
kubectl apply -f deployments/orders.yaml
kubectl apply -f deployments/payments.yaml
kubectl apply -f deployments/users.yaml
kubectl apply -f deployments/carts.yaml

kubectl apply -f deployments/products_db.yaml
kubectl apply -f deployments/carts_db.yaml

# Deploy Monitoring
kubectl create namespace monitoring
helm install loki grafana/loki-stack --namespace monitoring -f deployments/values-loki.yaml
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install promstack prometheus-community/kube-prometheus-stack --namespace monitoring --version 57.0.1 -f deployments/values-monitoring.yaml
helm upgrade kong kong/ingress -n kong --set gateway.serviceMonitor.enabled=true --set gateway.serviceMonitor.labels.release=promstack

# Start Tilt
tilt up
