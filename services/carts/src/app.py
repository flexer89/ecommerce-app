from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router

app = FastAPI(name="carts-service")
app.include_router(router=router)

instrumentator = Instrumentator(excluded_handlers=["/metrics", "k8s"])
latency_buckets = (0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 7.5, 10, 30, 60)
instrumentator.instrument(app, latency_lowr_buckets=latency_buckets).expose(app, include_in_schema=False)