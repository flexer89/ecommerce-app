from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
import os
from typing import List
from src.models import Product, Base
from src.models import Product as ProductModel
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


@router.get("/getall", response_model=list[ProductResponse])
def read_products(limit: int = 10, db: Session = Depends(get_db)):
    products = get_products_db(db, limit=limit)
    return products

@router.get("/getbyid/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_db(db, product_id=product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/get/{limit}/{offset}", response_model=List[ProductResponse])
def read_products(limit: int,offset: int, db: Session = Depends(get_db)
):
    products = get_products_list_db(db, limit=limit, offset=offset)
    
    if not products:
        raise HTTPException(status_code=404, detail="No more products available")
    
    return products

@router.post("/create", response_model=ProductResponse)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: Optional[int] = Form(0),
    discount: Optional[float] = Form(0),
    category: Optional[str] = Form('uncategorized'),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    image_data = await image.read() if image else None
    
    if discount < 0 or discount > 1:
        raise HTTPException(status_code=400, detail="Discount must be between 0 and 1")
    
    product_data = ProductCreate(
        name=name,
        description=description,
        price=price,
        image=image_data,
        stock=stock,
        discount=discount,
        category=category,
    )
    return create_product_db(db=db, product=product_data)

@router.put("/update/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product: ProductBase,
    db: Session = Depends(get_db)
):
    product_data = ProductUpdate(name=product.name, description=product.description, price=product.price, stock=product.stock, discount=product.discount, category=product.category)
    db_product = update_product_db(db=db, product_id=product_id, product=product_data)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/count", response_model=int)
def get_products_count(db: Session = Depends(get_db)):
    return count_db(db=db)

@router.put("/update/{product_id}/image", response_model=Product)
async def update_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    image_data = await image.read() if image else None
    db_product = update_product_image_db(db=db, product_id=product_id, image=image_data)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/delete/{product_id}", response_model=Product)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = delete_product_db(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/download/bin/{product_id}", response_class=FileResponse)
async def download_binary_product_image(product_id: int, db: Session = Depends(get_db)):
    product = get_product_db(db, product_id=product_id)
    if not product or not product.image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # Save the image to a temporary file
    temp_file_path = f"/tmp/product_{product_id}_image"
    with open(temp_file_path, "wb") as file:
        file.write(product.image)
    
    return FileResponse(temp_file_path, media_type="application/octet-stream", filename=f"product_{product_id}_image.bin")

@router.get("/download/png/{product_id}", response_class=FileResponse)
async def download_png_product_image(product_id: int, db: Session = Depends(get_db)):
    product = get_product_db(db, product_id=product_id)
    
    if not product or not product.image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    temp_file_path = f"/tmp/product_{product_id}_image.png"
    with open(temp_file_path, "wb") as file:
        file.write(product.image)

    return FileResponse(
        temp_file_path, 
        media_type="image/png", 
        filename=f"product_{product_id}_image.png"
    )
    
@router.get("/trends")
def get_product_trends(db: Session = Depends(get_db)):
    low_stock_products = (
        db.query(ProductModel)
        .filter(ProductModel.stock < 10)
        .order_by(ProductModel.stock.asc())
        .all()
    )

    thirty_days_ago = datetime.now() - timedelta(days=30)
    new_products = (
        db.query(ProductModel)
        .filter(ProductModel.created_at >= thirty_days_ago)
        .order_by(ProductModel.created_at.desc())
        .all()
    )

    discounted_products = (
        db.query(ProductModel)
        .filter(ProductModel.discount > 0)
        .order_by(ProductModel.discount.desc())
        .all()
    )
    
    out_of_stock_products = db.query(ProductModel).filter(ProductModel.stock == 0).count()

    return {
        "out_of_stock_product_amount": out_of_stock_products,
        "low_stock_products": [
            {
                "id": product.id,
                "name": product.name,
                "stock": product.stock,
                "price": product.price,
                "category": product.category,
            }
            for product in low_stock_products
        ],
        "new_products": [
            {
                "id": product.id,
                "name": product.name,
                "created_at": product.created_at,
                "price": product.price,
                "category": product.category,
            }
            for product in new_products
        ],
        "discounted_products": [
            {
                "id": product.id,
                "name": product.name,
                "discount": product.discount,
                "price": product.price,
                "category": product.category,
            }
            for product in discounted_products
        ],
    }