from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from src.routes import router
import logging
import contextvars
import json
import time
import uuid
import os
from typing import Any, Callable, Awaitable
from dotenv import load_dotenv

load_dotenv()

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
async def log_requests_and_responses(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Any:
    request_id: contextvars.ContextVar[str] = contextvars.ContextVar("Request id")
    if "/metrics" in request.url.path:
        return await call_next(request)
    req_id = str(uuid.uuid4())
    request_id.set(req_id)
    
    try:
        request_body = await request.json()
    except (json.JSONDecodeError, UnicodeDecodeError):
        request_body = "Not a JSON body or unable to decode"
    except Exception:
        request_body = "Unable to read request body"

    start_time = time.time()
    incoming_json = {
        "method": request.method,
        "url": str(request.url),
        "body": request_body
    }
    logger.info(f"{request_id.get()} | Incoming Request: {json.dumps(incoming_json, indent=2)}")

    try:
        response = await call_next(request)
        try:
            response_body = await response.json()
        except (json.JSONDecodeError, UnicodeDecodeError):
            response_body = "Not a JSON body or unable to decode"
        except Exception:
            response_body = "Unable to read response body"
    finally:
        assert req_id == request_id.get()

    end_time = time.time()
    outcoming_json = {
        "status_code": response.status_code,
        "url": str(request.url),
        "method": request.method, 
        "request_body": request_body,
        "response_body": response_body,
        "time": end_time - start_time,
    }
    logger.info(f"{request_id.get()} | Outcoming Response: {json.dumps(outcoming_json, indent=2)}")

    return response