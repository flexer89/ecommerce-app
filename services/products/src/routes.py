import base64
import logging
import os
from datetime import timedelta
from typing import Dict

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from src.database import *
from src.models import Base
from src.models import Product
from src.models import Product as ProductModel
from src.schemas import *

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)
router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/health", description="Check the health status test")
async def health() -> Dict[str, str]:
    logger.info("Health check requested")
    return {"status": "ok"}


@router.get("/getall", response_model=list[ProductResponse])
def read_products(limit: int = 10, db: Session = Depends(get_db)):
    products = get_products_db(db, limit=limit)
    return products


@router.get(
    "/getbyid/{product_id}",
    response_model=ProductResponse,
    responses={
        200: {"description": "Product retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Product not found"},
    },
    description="Retrieve a product by providing its `product_id`. ",
)
def read_product(product_id: int, db: Session = Depends(get_db)):
    logger.info(f"Request to retrieve product with ID {product_id}")
    product = get_product_db(db, product_id=product_id)
    if product is None:
        logger.warning(f"Product with ID {product_id} not found")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"Product with ID {product_id} retrieved successfully")
    return product


@router.get(
    "/get",
    response_model=ProductsListResponse,
    responses={
        200: {
            "description": "List of products retrieved successfully with pagination and filtering options."
        },
        404: {
            "model": ErrorResponse,
            "description": "No products found with the specified filters",
        },
    },
    description="Retrieve a paginated list of products with optional filtering by `category`, `minPrice`, `maxPrice`, and search by product name.",
)
def read_products(
    limit: int,
    offset: int,
    search: str = None,
    category: str = None,
    minPrice=None,
    maxPrice=None,
    sort_by: str = "",
    sort_order: str = "",
    db: Session = Depends(get_db),
):
    logger.info(
        f"Request to retrieve products with limit {limit}, offset {offset}, and filters"
    )
    products = get_products_list_db(
        db,
        limit=limit,
        offset=offset,
        search=search,
        category=category,
        minPrice=minPrice,
        maxPrice=maxPrice,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    if not products:
        logger.warning("No products found with the specified filters")
        raise HTTPException(status_code=404, detail="Products not found")
    logger.info("Products retrieved successfully")
    return {
        "products": products["products"],
        "total": products["total"],
        "total_max_price": products["max_price"],
    }


@router.post(
    "/create",
    response_model=ProductResponse,
    status_code=201,
    responses={
        201: {"description": "Product created successfully"},
        400: {
            "model": ErrorResponse,
            "description": "Invalid input data, such as incorrect discount value or missing required fields",
        },
    },
    description="Create a new product by providing its name, description, price, stock, discount, category, and an image.",
)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: Optional[int] = Form(0),
    discount: Optional[float] = Form(0),
    category: Optional[str] = Form("uncategorized"),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    logger.info(f"Request to create product with name {name}")
    image_data = await image.read() if image else None

    if discount < 0 or discount > 1:
        logger.warning("Invalid discount value provided")
        raise HTTPException(
            status_code=400, detail="Discount must be between 0 and 1"
        )

    product_data = ProductCreate(
        name=name,
        description=description,
        price=price,
        image=image_data,
        stock=stock,
        discount=discount,
        category=category,
    )
    product = create_product_db(db=db, product=product_data)
    logger.info(f"Product {name} created successfully with ID {product.id}")
    return product


@router.put(
    "/update/{product_id}",
    response_model=Product,
    responses={
        200: {"description": "Product updated successfully"},
        404: {"model": ErrorResponse, "description": "Product not found"},
    },
    description="Update an existing product by providing the `product_id` and the updated product details.",
)
async def update_product(
    product_id: int, product: ProductBase, db: Session = Depends(get_db)
):
    logger.info(f"Request to update product with ID {product_id}")
    product_data = ProductUpdate(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
        discount=product.discount,
        category=product.category,
    )
    db_product = update_product_db(
        db=db, product_id=product_id, product=product_data
    )
    if db_product is None:
        logger.warning(f"Product with ID {product_id} not found for update")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"Product with ID {product_id} updated successfully")
    return db_product


@router.get(
    "/count",
    response_model=int,
    responses={
        200: {
            "description": "The total count of products was retrieved successfully"
        }
    },
    description="Retrieve the total number of products available in the database.",
)
def get_products_count(db: Session = Depends(get_db)):
    logger.info("Request to retrieve total product count")
    total_count = count_db(db=db)
    logger.info(f"Total product count: {total_count}")
    return total_count


@router.put(
    "/update/{product_id}/image",
    response_model=Product,
    responses={
        200: {"description": "Product image updated successfully"},
        404: {"model": ErrorResponse, "description": "Product not found"},
    },
    description="Update the image of an existing product by providing the `product_id` and the new image file.",
)
async def update_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    logger.info(f"Request to update image for product ID {product_id}")
    image_data = await image.read() if image else None
    db_product = update_product_image_db(
        db=db, product_id=product_id, image=image_data
    )
    if db_product is None:
        logger.warning(
            f"Product with ID {product_id} not found for image update"
        )
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"Product image for ID {product_id} updated successfully")
    return db_product


@router.delete(
    "/delete/{product_id}",
    response_model=Product,
    responses={
        200: {"description": "Product deleted successfully"},
        404: {"model": ErrorResponse, "description": "Product not found"},
    },
    description="Delete an existing product by providing its `product_id`. Returns the details of the deleted product.",
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    logger.info(f"Request to delete product with ID {product_id}")
    db_product = delete_product_db(db, product_id=product_id)
    if db_product is None:
        logger.warning(f"Product with ID {product_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"Product with ID {product_id} deleted successfully")
    return db_product


@router.get(
    "/download/bin/{product_id}",
    response_class=FileResponse,
    responses={
        200: {"description": "Binary image file downloaded successfully"},
        404: {
            "model": ErrorResponse,
            "description": "Product or image not found",
        },
    },
    description="Download the binary image of a product by providing the `product_id`. "
    "If the product and its image exist, the image is returned as a binary file.",
)
async def download_binary_product_image(
    product_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    logger.info(
        f"Request to download binary image for product ID {product_id}"
    )
    product = get_product_db(db, product_id=product_id)
    if not product or not product.image:
        logger.warning(f"Image not found for product ID {product_id}")
        raise HTTPException(status_code=404, detail="Image not found")

    temp_file_path = f"/tmp/product_{product_id}_image"
    with open(temp_file_path, "wb") as file:
        file.write(product.image)

    background_tasks.add_task(os.remove, temp_file_path)
    logger.info(
        f"Binary image for product ID {product_id} downloaded successfully"
    )
    return FileResponse(
        temp_file_path,
        media_type="application/octet-stream",
        filename=f"product_{product_id}_image.bin",
    )


@router.get(
    "/download/images",
    responses={
        200: {
            "description": "Images retrieved and encoded in Base64 successfully"
        },
        404: {
            "model": ErrorResponse,
            "description": "No product IDs provided or no images found for the provided product IDs",
        },
    },
    description="Retrieve and download images for multiple products by providing their `product_ids`. "
    "The images are returned in Base64 encoded format.",
)
async def download_multiple_images(
    product_ids: Optional[str], db: Session = Depends(get_db)
):
    logger.info(f"Request to download images for products: {product_ids}")
    if not product_ids:
        logger.warning("No product IDs provided")
        raise HTTPException(status_code=404, detail="No product IDs provided")

    product_ids = product_ids.split(
        ","
    )  # Split the string into a list of product IDs
    images_data = {}
    for product_id in product_ids:
        product = get_product_db(db, product_id=product_id)
        if not product or not product.image:
            continue  # Skip if image not found
        encoded_image = base64.b64encode(product.image).decode("utf-8")
        images_data[str(product_id)] = encoded_image

    if not images_data:
        logger.warning("No images found for the provided product IDs")
        raise HTTPException(
            status_code=404,
            detail="No images found for the provided product IDs",
        )

    logger.info("Images retrieved and encoded in Base64 successfully")
    return images_data


@router.get(
    "/trends",
    responses={200: {"description": "Product trends retrieved successfully"}},
    description="Retrieve product trends including low stock products, new products in the last 30 days, "
    "discounted products, and the count of out-of-stock products.",
)
def get_product_trends(db: Session = Depends(get_db)):
    logger.info("Request to retrieve product trends")

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
    out_of_stock_products = (
        db.query(ProductModel).filter(ProductModel.stock == 0).count()
    )

    logger.info("Product trends retrieved successfully")
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


@router.post(
    "/update-quantity",
    response_model=dict,
    responses={
        200: {"description": "Quantities updated successfully"},
        400: {
            "model": ErrorResponse,
            "description": "Insufficient quantity or product not found",
        },
    },
    description="Update the quantity of products based on the requested items. If the requested quantity exceeds the available stock, "
    "an error is returned with a list of unavailable products.",
)
async def update_quantity_endpoint(
    request: UpdateQuantityRequest, db: Session = Depends(get_db)
):
    logger.info(f"Request to update quantity for products: {request.items}")
    unavailable_products = []

    for item in request.items:
        product = (
            db.query(ProductModel)
            .filter(ProductModel.id == item.product_id)
            .first()
        )

        if product:
            if product.stock < item.quantity:
                unavailable_products.append(product.name)
            else:
                product.stock -= item.quantity
        else:
            unavailable_products.append(
                f"Product with ID {item.product_id} not found"
            )

    if unavailable_products:
        logger.warning(
            f"Insufficient quantity for products: {unavailable_products}"
        )
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient quantity for the following products: {', '.join(unavailable_products)}",
        )

    db.commit()
    logger.info("Product quantities updated successfully")
    return {"status": "success", "message": "Quantities updated successfully"}


@router.get(
    "/categories",
    response_model=list[str],
    responses={200: {"description": "Categories retrieved successfully"}},
    description="Retrieve all available categories for products.",
)
def get_categories(db: Session = Depends(get_db)):
    logger.info("Request to retrieve all categories")
    categories = get_categories_db(db)
    logger.info("Categories retrieved successfully")
    return categories
