from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from routes import router

app = FastAPI(name='payments-service')
app.include_router(router=router)

instrumentator = Instrumentator(excluded_handlers=["/metrics", "k8s"])
instrumentator.instrument(app).expose(app)
