from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router

app = FastAPI(name="carts-service")
app.include_router(router=router)

instrumentator = Instrumentator(
    excluded_handlers=["/metrics", "k8s", "/health", "/docs", "/redoc"]
)
instrumentator.instrument(app).expose(app, include_in_schema=False)
