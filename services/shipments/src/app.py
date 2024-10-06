import contextvars
import logging
import time
import uuid
from typing import Any, Awaitable, Callable

from fastapi import FastAPI, Request, Response
from prometheus_fastapi_instrumentator import Instrumentator

from src.routes import router

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO, format="%(levelname)s      %(asctime)s - %(message)s"
)
request_id_contextvar = contextvars.ContextVar("request_id", default=None)

app = FastAPI(name="shipments-service")
app.include_router(router=router)

instrumentator = Instrumentator(excluded_handlers=["/metrics", "k8s"])
latency_buckets = (
    0.01,
    0.025,
    0.05,
    0.075,
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    1.5,
    2,
    2.5,
    3,
    3.5,
    4,
    4.5,
    5,
    7.5,
    10,
    30,
    60,
)
instrumentator.instrument(app, latency_lowr_buckets=latency_buckets).expose(
    app, include_in_schema=False
)


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
        "body": await request.body(),
    }
    logger.info(f"{request_id.get()} | Incoming Request: {incoming_json}")

    try:
        # Process the request and capture the response
        response = await call_next(request)

        # Capture the response body
        response_body = b""
        async for chunk in response.body_iterator:
            response_body += chunk

        # Rebuild the response with the captured body
        response = Response(
            content=response_body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )
    finally:
        assert req_id == request_id.get()

    end_time = time.time()
    outcoming_json = {
        "status_code": response.status_code,
        "content": response_body.decode("utf-8") if response_body else None,
        "time": end_time - start_time,
    }
    logger.info(f"{request_id.get()} | Outcoming Response: {outcoming_json}")

    return response
