from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router
import logging
import contextvars
import time
import uuid
import os

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG, format="%(levelname)s      %(asctime)s - %(message)s"
)
request_id_contextvar = contextvars.ContextVar("request_id", default=None)

if os.getenv("ENV") in ["test", "dev"]:
    app = FastAPI(name="products-service")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
else:
    app = FastAPI(name="products-service", docs_url=None, redoc_url=None)

app.include_router(router=router)

instrumentator = Instrumentator(
    excluded_handlers=["/metrics", "k8s", "/health", "/docs", "/redoc"]
)
instrumentator.instrument(app).expose(app, include_in_schema=False)


@app.middleware("http")
async def log_requests_and_responses(request: Request, call_next):
    if "/metrics" in request.url.path:
        return await call_next(request)
    request_id = str(uuid.uuid4())
    request_id_contextvar.set(request_id)

    start_time = time.time()
    incoming_json = {
        "method": request.method,
        "url": request.url,
        # "headers": dict(request.headers),
        # "body": dict(request),
    }
    logger.info(f"{request_id} | Incoming Request: {incoming_json}")

    try:
        response = await call_next(request)
    finally:
        assert request_id_contextvar.get() == request_id

    end_time = time.time()
    outcoming_json = {
        "status_code": response.status_code,
        # "headers": dict(response.headers),
        # "body": dict(request),
        "time": end_time - start_time,
    }
    logger.info(f"{request_id} | Outcoming Response: {outcoming_json}")

    return response
