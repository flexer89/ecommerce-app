kubectl port-forward svc/products-service 5000:5000 &
kubectl port-forward svc/orders-service 5010:5010 &
kubectl port-forward svc/payments-service 5020:5020 &
kubectl port-forward svc/users-service 5030:5030 &
kubectl port-forward svc/carts-service 5040:5040 &
kubectl port-forward svc/shipments-service 5050:5050 \
