# Prerequsities
1. Python 3.11
2. Docker
3. Minikube
4. kubectl
5. helm
6. tilt

# Create tunnel
```
minikube tunnel
```

# Ports

- products service - 5000
- orders service - 5010
- payments service - 5020
- users service - 5030
- carts service - 5040

# Services

## Products service
### Description
This service is responsible for managing products in the store. It allows to add, update, delete and filter products.

### Routes
- **GET** Health Status: `products/health`
- **POST** Add a Product: `products/add`
- **POST** Filter Products: `products/filter`
- **GET** Get Product by ID: `products/get/{product_id}`
- **PATCH** Update Product by ID: `products/update/{product_id}`
- **DELETE** Delete Product by ID: `products/delete/{product_id}`

### Run as a standalone service
To run the service as a standalone service, you need to run the following command:
```
cd services/products
docker compose up
```
Make sure that you have installed all the required dependencies and have free port 5000.

To stop the service, you need to run the following command:
```
docker compose down
```
It will stop the service and remove the container.

### Testing
To run tests, you need to run the following command:
```
./products/scripts/test.sh
```


## Orders service
- GET Health Status `orders/health`
- ...

## Users service
- GET Health Status `users/health`
- ...

## Carts service
### Description
This service is responsible for managing user carts. It allows to add, remove and get user cart.

### Routes
- **GET** Health Status `carts/health`
- **POST** Remove item from cart `carts/remove`
- **GET** Get user cart `carts/get`
- **POST** Add to cart `carts/add`
- **DELETE** Delete a cart `carts/`

### Run as a standalone service
To run the service as a standalone service, you need to run the following command:
```
cd services/carts
docker compose up
```
Make sure that you have installed all the required dependencies and have free port 5040.

To stop the service, you need to run the following command:
```
docker compose down
```
It will stop the service and remove the container.

### Testing
To run tests, you need to run the following command:
```
./carts/scripts/test.sh
```

## Payments service
- GET Health Status `payments/health`
- ...

# Load Tests
To run load tests, you need to run the following command:
```
cd services{SERVICE_NAME}/tests     # only products service has tests for now
```
Then you need to install locust:
```
pip install locust
```
And then run the following command:
```
locust -f locustfile.py
```
It will start the locust server and you can access it at `http://localhost:8089`
Then you can set the number of users and hatch rate and start the test.


# Access Grafana

To access dashboards you need firstly forward a port
```
kubectl -n monitoring port-forward services/promstack-grafana 3000:80
```

Grafana is available at `http://localhost:3000`

To log in, type:
- Username: admin
- Password: prom-operator

## Adding Prometheus data source
1. Go to Data Sources
2. Click Add data source
3. Choose Prometheus
4. Set URL to `http://promstack-kube-prometheus-prometheus:9090`
5. Click Save & Test

## Creating a dashboard
1. Go to Dashboards
2. Click Manage
3. Click Import
4. Choose a JSON file with a dashboard
5. Click Import
