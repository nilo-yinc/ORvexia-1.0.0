from pydantic import Field
from .shared import BaseAPIModel

class InventoryCheckRequest(BaseAPIModel):
    sku: str = Field(..., description="Stock Keeping Unit identifier", example="GADGET-001")

class InventoryCheckResponse(BaseAPIModel):
    stock_level: int
    warehouse_loc: str
    status: bool = Field(..., description="True if item is available")

class ShippingLabelRequest(BaseAPIModel):
    address: str
    weight: float = Field(..., gt=0, description="Weight in kg")

class ShippingLabelResponse(BaseAPIModel):
    tracking_id: str
    carrier: str
    cost: float
