from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router

app = FastAPI(name="users-service")
app.include_router(router=router)

instrumentator = Instrumentator(excluded_handlers=["/metrics", "k8s"])
instrumentator.instrument(app).expose(app, include_in_schema=False)