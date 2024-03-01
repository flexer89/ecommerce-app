from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router

app = FastAPI(name="products-service")
app.include_router(router=router)

instrumentator = Instrumentator(
    excluded_handlers=["/metrics", "k8s", "/health", "/docs", "/redoc"]
)
instrumentator.instrument(app).expose(app, include_in_schema=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
