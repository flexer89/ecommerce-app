docker_build('client-app','client-app/',
    live_update=[
        sync('./client-app', '/app'),
        run('cd /app && npm install', trigger='./client-app/package.json')
    ]
)

docker_build('admin-app','admin-app/',
    live_update=[
        sync('./admin-app', '/app'),
        run('cd /app && npm install', trigger='./admin-app/package.json')
    ]
)

docker_build('products', 'services/products',
    live_update=[
        sync('services/products', '/products'),
])

docker_build('orders', 'services/orders',
    live_update=[
        sync('services/orders', '/orders'),
])

docker_build('users', 'services/users',
    live_update=[
        sync('services/users', '/users'),
])

docker_build('carts', 'services/carts',
    live_update=[
        sync('services/carts', '/carts'),
])

docker_build('payments', 'services/payments',
    live_update=[
        sync('services/payments', '/payments'),
])

docker_build('shipments', 'services/shipments',
    live_update=[
        sync('services/shipments', '/shipments'),
])

docker_build('kraken','kraken/')
docker_build('keycloak','keycloak/')

k8s_yaml('deployments/products.yaml')
k8s_yaml('deployments/orders.yaml')
k8s_yaml('deployments/users.yaml')
k8s_yaml('deployments/shipments.yaml')
k8s_yaml('deployments/payments.yaml')
k8s_yaml('deployments/carts.yaml')
k8s_yaml('deployments/client-app.yaml')
k8s_yaml('deployments/admin-app.yaml')
k8s_yaml('deployments/kraken.yaml')
k8s_yaml('deployments/keycloak.yaml')

k8s_yaml('deployments/databases/products_db.yaml')
k8s_yaml('deployments/databases/carts_db.yaml')
k8s_yaml('deployments/databases/orders_db.yaml')
k8s_yaml('deployments/databases/shipments_db.yaml')
k8s_yaml('deployments/databases/keycloak_db.yaml')
#k8s_yaml('deployments/smtp-server.yaml')
