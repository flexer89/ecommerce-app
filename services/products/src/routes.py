from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
import os
from src.models import Product, Base
from typing import Dict
from sqlalchemy.orm import Session
from src.database import *
from src.schemas import *

Base.metadata.create_all(bind=engine)
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/k8s", include_in_schema=False)
async def k8s() -> Dict[str, str | None]:
    env_vars = {
        "HOSTNAME": os.getenv("HOSTNAME"),
        "KUBERNETES_PORT": os.getenv("KUBERNETES_PORT"),
    }
    return env_vars


@router.get("/health", description="Check the health status test")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/getall", response_model=list[Product])
def read_products(limit: int = 10, db: Session = Depends(get_db)):
    products = get_products_db(db, limit=limit)
    return products

@router.get("/getbyid/{product_id}", response_model=Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_db(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/create", response_model=Product)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    image_data = await image.read() if image else None
    product_data = ProductCreate(name=name, description=description, price=price, image=image_data)
    return create_product_db(db=db, product=product_data)

@router.put("/update/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    image_data = await image.read() if image else None
    product_data = ProductUpdate(name=name, description=description, price=price, image=image_data)
    db_product = update_product_db(db=db, product_id=product_id, product=product_data)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/delete/{product_id}", response_model=Product)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = delete_product_db(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

# Endpoint to return a file
@router.get("/download/{product_id}", response_class=FileResponse)
async def download_product_image(product_id: int, db: Session = Depends(get_db)):
    product = get_product_db(db, product_id=product_id)
    if not product or not product.image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Save the image to a temporary file
    temp_file_path = f"/tmp/product_{product_id}_image"
    with open(temp_file_path, "wb") as file:
        file.write(product.image)
    
    return FileResponse(temp_file_path, media_type="application/octet-stream", filename=f"product_{product_id}_image.bin")