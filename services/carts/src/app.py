from fastapi import FastAPI, Request, Response
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router
import logging
import contextvars
import time
import uuid
import os
from typing import Any, Callable, Awaitable

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.DEBUG, format="%(levelname)s      %(asctime)s - %(message)s"
)
request_id_contextvar = contextvars.ContextVar("request_id", default=None)

if os.getenv("ENV") in ["test", "dev"]:
    app = FastAPI(name="carts-service")
else:
    app = FastAPI(name="carts-service", docs_url=None, redoc_url=None)

app.include_router(router=router)

instrumentator = Instrumentator(
    excluded_handlers=["/metrics", "k8s", "/health", "/docs", "/redoc"]
)
latency_buckets = (0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 7.5, 10, 30, 60)
instrumentator.instrument(app, latency_lowr_buckets=latency_buckets).expose(app, include_in_schema=False)


@app.middleware("http")
async def log_requests_and_responses(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Any:
    request_id: contextvars.ContextVar[str] = contextvars.ContextVar("Request id")
    if "/metrics" in request.url.path:
        return await call_next(request)
    req_id = str(uuid.uuid4())
    request_id.set(req_id)

    start_time = time.time()
    incoming_json = {
        "method": request.method,
        "url": request.url,
        "headers": dict(request.headers),
        "body": dict(request),
    }
    logger.info(f"{request_id.get()} | Incoming Request: {incoming_json}")

    try:
        response = await call_next(request)
    finally:
        assert req_id == request_id.get()

    end_time = time.time()
    outcoming_json = {
        "status_code": response.status_code,
        "headers": dict(response.headers),
        "body": dict(request),
        "time": end_time - start_time,
    }
    logger.info(f"{request_id.get()} | Outcoming Response: {outcoming_json}")

    return response
