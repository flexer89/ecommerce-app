from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database import *
from src.models import Base
from src.schemas import *

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


@router.post(
    "/create",
    response_model=ShipmentResponse,
    status_code=201,
    responses={
        201: {"description": "Shipment created successfully"},
    },
    description="Create a new shipment for an order. This endpoint allows creating a shipment record by providing the necessary shipment details.",
)
def create_shipment(shipment: ShipmentCreate, db: Session = Depends(get_db)):
    return create_shipment_db(db=db, shipment=shipment)


@router.patch(
    "/update/{shipment_id}",
    response_model=ShipmentResponse,
    responses={
        200: {"description": "Shipment updated successfully"},
        404: {"description": "Shipment not found"},
    },
    description="Update an existing shipment by providing the shipment ID and the updated shipment data.",
)
def update_shipment(
    shipment_id: int, shipment: ShipmentUpdate, db: Session = Depends(get_db)
):
    db_shipment = update_shipment_db(
        db=db, shipment_id=shipment_id, shipment=shipment
    )
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment


@router.get(
    "/getbyorder/{order_id}",
    response_model=ShipmentResponse,
    responses={
        200: {"description": "Shipment retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Shipment not found"},
    },
    description="Retrieve shipment details for a specific order by providing the `order_id`. "
    "If the shipment exists, it returns the shipment details.",
)
def read_shipment_by_order_id(order_id: int, db: Session = Depends(get_db)):
    db_shipment = get_shipment_by_order_id_db(db, order_id=order_id)
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment


@router.get(
    "/getbyuser/{user_id}",
    response_model=list[ShipmentResponse],
    responses={
        200: {"description": "Shipments retrieved successfully for the user"},
        404: {"description": "No shipments found for the user"},
    },
    description="Retrieve all shipments associated with a specific user by providing their `user_id`. "
    "If shipments exist, it returns a list of shipment details.",
)
def read_shipment_by_user_id(user_id: UUID, db: Session = Depends(get_db)):
    db_shipment = get_shipment_by_user_id_db(db, user_id=str(user_id))
    if db_shipment is None:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return db_shipment


@router.get(
    "/count",
    response_model=CountResponse,
    responses={
        200: {
            "description": "Total number of shipments retrieved successfully"
        },
    },
    description="Retrieve the total count of all shipments in the system.",
)
def count_shipments(db: Session = Depends(get_db)):
    return {"total": count_shipments_db(db)}


@router.get(
    "/get",
    response_model=GetShipmentResponse,
    responses={
        200: {
            "description": "Shipments retrieved successfully with pagination"
        },
    },
    description="Retrieve a paginated list of shipments, optionally filtered by status and search parameters.",
)
def get_shipments(
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
    status: str = None,
    search: int = None,
):
    shipments = get_all_shipments_db_paginated(
        SessionLocal(),
        limit=limit,
        offset=offset,
        status=status,
        search=search,
    )
    total = get_shipments_count(db, status=status)

    return {"total": total, "shipments": shipments}
