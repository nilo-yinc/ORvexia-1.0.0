import asyncio
import random
from fastapi import APIRouter
from app.models.ecommerce import InventoryCheckRequest, InventoryCheckResponse

router = APIRouter()

@router.post("/inventory/check", response_model=InventoryCheckResponse)
async def check_inventory(request: InventoryCheckRequest):
    # Simulate network latency
    await asyncio.sleep(random.uniform(0.5, 2.0))
    
    # Simulation Logic:
    # Deterministic randomness based on SKU for consistency in demos, 
    # or pure random for chaos? Prompt says "simulate complex real-world... Randomness".
    # We'll use pure random for dynamic feel.
    
    stock = random.randint(0, 500)
    # Warehouse location format: "WH-{Section}-{Row}"
    warehouse = f"WH-{random.choice(['A', 'B', 'C'])}-{random.randint(1, 99):02d}"
    
    return InventoryCheckResponse(
        stock_level=stock,
        warehouse_loc=warehouse,
        status=stock > 0
    )
