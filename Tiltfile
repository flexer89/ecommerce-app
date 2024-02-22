docker_build('products', 'services/products', 
    live_update=[
        sync('services/products', '/products'),
])

docker_build('orders', 'services/orders', 
    live_update=[
        sync('services/orders', '/orders'),
])

docker_build('carts', 'services/carts', 
    live_update=[
        sync('services/carts', '/carts'),
])

docker_build('users', 'services/users', 
    live_update=[
        sync('services/users', '/users'),
])

docker_build('payments', 'services/payments', 
    live_update=[
        sync('services/payments', '/payments'),
])

k8s_yaml('deployments/products.yaml')
k8s_yaml('deployments/orders.yaml')
k8s_yaml('deployments/payments.yaml')
k8s_yaml('deployments/users.yaml')
k8s_yaml('deployments/carts.yaml')