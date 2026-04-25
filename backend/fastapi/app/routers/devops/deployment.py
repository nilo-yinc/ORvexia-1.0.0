import asyncio
import random
import uuid
from fastapi import APIRouter
from app.models.devops import DeploymentTriggerRequest, DeploymentTriggerResponse

router = APIRouter()

@router.post("/deployment/trigger", response_model=DeploymentTriggerResponse)
async def trigger_deployment(request: DeploymentTriggerRequest):
    # Simulate CI/CD pipeline setup
    await asyncio.sleep(random.uniform(0.5, 2.0))
    
    # 10% failure simulation
    if random.random() < 0.1:
        # Simulating a build failure (e.g. tests failed)
        return DeploymentTriggerResponse(
            build_id=f"BLD-FAIL-{str(uuid.uuid4())[:6].upper()}",
            server_ip="N/A",
            status="failure"
        )

    # Success path
    build_id = f"BLD-{str(uuid.uuid4())[:8].upper()}"
    # Generate random private IP
    server_ip = f"10.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 254)}"
    
    return DeploymentTriggerResponse(
        build_id=build_id,
        server_ip=server_ip,
        status="success"
    )
