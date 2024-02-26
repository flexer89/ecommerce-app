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
./products/scripts/run.sh
```
Make sure that you have installed all the required dependencies and have free port 5000.

To stop the service, you need to run the following command:
```
./products/scripts/stop.sh
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
This service is responsible for managing products in the store. It allows to add, update, delete and filter products.

### Routes
- **GET** Health Status `carts/health`
- **POST** Create a Cart `carts/add`
- **GET** Get user cart `/carts`
- **POST** Add to cart `carts/`
- **DELETE** Delete a cart `carts/`

### Run as a standalone service
To run the service as a standalone service, you need to run the following command:
```
./products/scripts/run.sh
```
Make sure that you have installed all the required dependencies and have free port 5000.

To stop the service, you need to run the following command:
```
./products/scripts/stop.sh
```
It will stop the service and remove the container.

### Testing
To run tests, you need to run the following command:
```
./products/scripts/test.sh
```

## Payments service
- GET Health Status `payments/health`
- ...

# Access Grafana

To access dashboards you need firstly forward a port
```
kubectl -n monitoring port-forward services/promstack-grafana 3000:80
```

Grafana is available at `http://localhost:3000`

To log in, type:
- Username: admin 
- Password: prom-operator
