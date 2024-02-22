from fastapi import APIRouter
import os

router = APIRouter()

@router.get('/k8s')
def k8s():
    env_vars = {
        'HOSTNAME': os.getenv('HOSTNAME'),
        'KUBERNETES_PORT': os.getenv('KUBERNETES_PORT')
    }
    return env_vars

@router.get('/health')
def health():
    return {"status": "ok"}
    