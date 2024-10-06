# Prerequsities
1. Python 3.11
2. Docker
3. Minikube
4. kubectl
5. helm
6. tilt

# Ports

- products service - 5000
- orders service - 5010
- payments service - 5020
- carts service - 5040

# Services

## Products service
### Description
This service is responsible for managing products in the store. It allows to add, update, delete and filter products.
See the [API documentation](https://bump.sh/jolszak/hub/ecommerce-app/doc/products-service) for more details.

## Orders service
- GET Health Status `orders/health`
- ...

## Carts service
### Description
This service is responsible for managing user carts. It allows to add, remove and get user cart.

### Routes
- **GET** Health Status `carts/health`
- **POST** Remove item from cart `carts/remove`
- **GET** Get user cart `carts/get`
- **POST** Add to cart `carts/add`
- **DELETE** Delete a cart `carts/delete`


## Payments service
- GET Health Status `payments/health`
- ...

# Start/Setup Cluster
To setup the cluster, you need to run the following command:
```
./cluster_setup.sh
```
It will start the minikube cluster and install all the required dependencies.
If you want to start the cluster, you need to run the following command:
```
./start.sh
```

If cluster is running, you need to add ingress addon:
```
minikube addons enable ingress
```
Apply ingresses:
```
kubectl apply -f deployments/overlays/ingress.yaml
```
And then create a tunnel:
```
minikube tunnel
```
Then you need to add the following lines to the /etc/hosts file (Linux) or C:\Windows\System32\drivers\etc\hosts file (Windows)
```
127.0.0.1 auth.jolszak.test
127.0.0.1 admin.jolszak.test
127.0.0.1 jolszak.test
127.0.0.1 monitoring.jolszak.test
```
If you want to stop the cluster, you need to run the following command:
```
./stop.sh
```

# Run as a standalone service
To run the service as a standalone service, you need to run the following command:
```
cd services/{SERVICE_NAME}
docker compose up
```
Make sure that you have installed all the required dependencies and have a proper port available.

To stop the service, you need to run the following command:
```
docker compose down
```
It will stop the service and remove the container.

# Unit Tests
To run tests, you need to run the following command:
```
cd services/{SERVICE_NAME}
./scripts/test.sh
```

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
Grafana is available at `monitoring.jolszak.test`.

To log in, type:
- Username: admin
- Password: prom-operator

## Adding Prometheus data source
1. Go to Data Sources
2. Click Add data source
3. Choose Prometheus
4. Set URL to `http://promstack-kube-prometheus-prometheus:9090`
5. Click Save & Test

## Import dashboards
1. Go to Dashboards
2. Click Manage
3. Click Import
3.1. Enter dashboard ID for Krakend: `20651`
3.2  Enter dashboard ID for Keycloak: `19659`
3.2. Import deployments/dashboards/fastapi-dashboard.json

# Secrets
You need to provide the secrets for the services. You need to create a file called `.secrets.yaml` in the deploments/secrets directory. The file should look like .secrets-example.yaml file.
You also need to fill .env files in the services directories. The file should look like .env-example file.

# Keycloak setup
To setup Keycloak, you need to go to `http://auth.jolszak.test` and log in with admin/admin credentials.
Then you need to create a new realm (keycloak json is available under /keycloak folder) You can do it by going to Master Realm -> Add Realm.

Keycloak requires an SMTP server to send emails. You can go to Realm Settings -> Email -> SMTP Server and fill the form.
I am using Mailgun in Github Student Developer Pack. You can use it as well.
SMTP Server is needed to send email confirmation to the user, password reset and other emails.

You also need to go to authentication -> required actions and enable VERIFY_EMAIL

# Sample data
To add sample data to all services, you need to run `./port_forward.sh` and then run `./sample_data.sh` in another terminal.

# Sources
free-psd-templates.com
