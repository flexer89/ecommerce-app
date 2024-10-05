from fastapi import APIRouter, Depends, HTTPException
import os
from sqlalchemy import func
from src.database import *
from src.schemas import *
from typing import Dict
from src.models import Base
from src.models import Order as OrderModel
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)
router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get(
    "/get/{order_id}", 
    response_model=Order, 
    status_code=200,
    responses={
        200: {"description": "Order found and returned successfully", "content": {"application/json": {}}},
        404: {"model": ErrorResponse, "description": "Order not found", },
    },
    description="Retrieve the details of a specific order by its ID. "
                "If the order exists, it returns the order details. "
                "If the order is not found, a 404 error is raised."
)
def read_order(order_id: int, db: Session = Depends(get_db)):
    order = get_order_db(db, order_id=order_id)
    
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post(
    "/create", 
    response_model=CreateOrderResponse, 
    status_code=201,
    responses={
        201: {"model": CreateOrderResponse, "description": "Order created successfully"},
        500: {"model": ErrorResponse, "description": "Internal server error or database error"}
    },
    description="Create a new order in the database. This endpoint accepts order details in the request body and "
                "returns the ID of the newly created order."
)
async def create_order(order: CreateOrderRequest, db: Session = Depends(get_db)) -> Dict[str, str]:
    try:
        created_order_id = create_order_db(db, order)

        return {"order_id": created_order_id}

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.put(
    "/update/{order_id}/status", 
    response_model=Order, 
    status_code=200,
    responses={
        200: {"description": "Order status updated successfully"},
        404: {"model": ErrorResponse, "description": "Order not found"},
    },
    description="Update the status of a specific order. The client must provide the order ID and the new status."
)
def update_order_status(order_id: int, order_update: OrderUpdateStatus, db: Session = Depends(get_db)):
    order = update_order_status_db(db, order_id=order_id, status=order_update.status)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get(
    "/getbyuser/{user_id}", 
    response_model=list[Order], 
    status_code=200,
    responses={
        200: {"description": "Orders retrieved successfully"},
        404: {"model": ErrorResponse, "description": "No orders found for the specified user"},
    },
    description="Retrieve all orders for a specific user by their user ID. A limit can be provided to restrict the "
                "number of returned orders."
)
def read_orders_by_user(user_id: UUID, limit: int = 10, db: Session = Depends(get_db)):
    orders = get_orders_by_user_id_db(db, user_id=str(user_id), limit=limit)
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    return orders

@router.get(
    "/bestsellers", 
    response_model=list[Bestseller], 
    status_code=200,
    responses={
        200: {"description": "Bestselling products retrieved successfully"},
    },
    description="Retrieve a list of the best-selling products. The result contains the product ID and the count of orders. "
                "You can limit the number of bestsellers returned by specifying the `limit` parameter."
)
def get_bestsellers(limit: int = 3, db: Session = Depends(get_db)):
    result = get_bestsellers_db(db, limit=limit)
    return [
        {
            "product_id": product_id,
            "order_count": order_count
        }
        for product_id, order_count in result
    ]

@router.get(
    "/trends", 
    response_model=Dict, 
    status_code=200,
    responses={
        200: {"description": "Order trends retrieved successfully"},
    },
    description="Retrieve order trends, including monthly trends for orders and revenue, average processing time, "
                "order status counts, cancellations, conversion rate, and top customers. This endpoint returns "
                "various metrics related to the order data."
)
def get_order_trends(db: Session = Depends(get_db)):
    monthly_trends = (
        db.query(
            func.date_trunc('month', OrderModel.created_at).label('month'),
            func.count(OrderModel.id).label('total_orders'),
            func.sum(OrderModel.total_price).label('total_revenue')
        )
        .group_by(func.date_trunc('month', OrderModel.created_at))
        .order_by(func.date_trunc('month', OrderModel.created_at))
        .all()
    )
    
    avg_processing_time = db.query(
        func.avg(
            func.extract('epoch', OrderModel.updated_at - OrderModel.created_at) / 3600
        )
    ).filter(OrderModel.status == 'shipped').scalar()

    if not avg_processing_time:
        avg_processing_time = 0

    order_status_counts = db.query(OrderModel.status, func.count(OrderModel.id).label("order_count")) \
                            .group_by(OrderModel.status).all()
                            
    order_status_counts_transformed = [
        {"status": status, "order_count": count}
        for status, count in order_status_counts
    ]
    
    total_orders = db.query(func.count(OrderModel.id)).scalar()

    cancellations_count = db.query(func.count(OrderModel.id)) \
                            .filter(OrderModel.status == 'cancelled').scalar()

    from sqlalchemy import case, cast, Float

    conversion_rate = db.query(
        cast(
            func.sum(
                case(
                    (OrderModel.status.in_(['shipped', 'delivered']), 1)
                )
            ), Float
        ) / func.count(OrderModel.id)
    ).scalar()

    if not conversion_rate:
        conversion_rate = 0

    top_customers = db.query(
        OrderModel.user_id,
        func.count(OrderModel.id).label('orders_count'),
        func.sum(OrderModel.total_price).label('total_spent')
    ).group_by(OrderModel.user_id) \
     .order_by(func.sum(OrderModel.total_price).desc()) \
     .limit(5).all()

    top_customers_transformed = [
        {"user_id": customer.user_id, "orders_count": customer.orders_count, "total_spent": float(customer.total_spent)}
        for customer in top_customers
    ]

    return {
        "monthly_trends": [
            OrderTrendResponse(
                month=trend.month.strftime('%Y-%m'),
                total_orders=trend.total_orders,
                total_revenue=float(trend.total_revenue or 0)
            ).dict()
            for trend in monthly_trends
        ],
        "avg_processing_time": avg_processing_time,
        "order_status_counts": order_status_counts_transformed,
        "cancellations_count": cancellations_count,
        "conversion_rate": conversion_rate,
        "top_customers": top_customers_transformed,
    }

    
@router.get(
    "/count", 
    response_model=int, 
    status_code=200,
    responses={
        200: {"description": "Total number of orders retrieved successfully"},
    },
    description="Retrieve the total count of all orders in the system."
)
def get_orders_count(db: Session = Depends(get_db)):
    return count_db(db)

@router.get(
    "/get", 
    response_model=GetOrdersResponse, 
    status_code=200,
    responses={
        200: {"model": GetOrdersResponse, "description": "Orders retrieved successfully"}
    },
    description="Retrieve a list of orders with optional filters such as status, search by order ID, pagination with limit "
                "and offset. Returns the list of orders and the total count."
)
def get_orders(db: Session = Depends(get_db), limit: int = 10, offset: int = 0, status: str = None, search: int = None):
    return get_orders_db(db=db, limit=limit, offset=offset, status=status, search=search)
    