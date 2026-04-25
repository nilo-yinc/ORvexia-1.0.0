import asyncio
import random
import string
from fastapi import APIRouter
from app.models.ecommerce import ShippingLabelRequest, ShippingLabelResponse

router = APIRouter()

@router.post("/shipping/label", response_model=ShippingLabelResponse)
async def create_shipping_label(request: ShippingLabelRequest):
    # Simulate API interaction latency (e.g. talking to FedEx API)
    await asyncio.sleep(random.uniform(0.5, 2.0))
    
    # Generate realistic-looking tracking ID
    # e.g., "TRK-9988-X"
    suffix = ''.join(random.choices(string.ascii_uppercase, k=1))
    tracking_id = f"TRK-{random.randint(1000, 9999)}-{suffix}"
    
    carrier = random.choice(["FedEx", "UPS", "DHL", "USPS"])
    
    # Base cost + weight factor
    cost = round(5.00 + (request.weight * 2.5) + random.uniform(0, 5), 2)
    
    return ShippingLabelResponse(
        tracking_id=tracking_id,
        carrier=carrier,
        cost=cost
    )
