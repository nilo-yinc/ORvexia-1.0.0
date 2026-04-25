import asyncio
import random
from datetime import datetime, timedelta
from fastapi import APIRouter
from app.models.marketing import CampaignSendRequest, CampaignSendResponse

router = APIRouter()

@router.post("/campaign/send", response_model=CampaignSendResponse)
async def send_campaign(request: CampaignSendRequest):
    # Simulate processing time for large email lists
    latency = random.uniform(0.5, 2.0)
    if request.recipient_count > 10000:
        latency += 1.0 # Extra simulated lag for heavy load
    await asyncio.sleep(latency)
    
    # Simulate partial failures or bounces (95-100% success rate)
    success_rate = random.uniform(0.95, 1.0)
    sent_count = int(request.recipient_count * success_rate)
    
    # Predict open rate based on subject line length (just a heuristic for simulation)
    # Shorter subjects might perform better in this mock logic
    base_open_rate = random.uniform(0.15, 0.35)
    if len(request.subject) < 50:
        base_open_rate += 0.05
        
    return CampaignSendResponse(
        emails_sent=sent_count,
        open_rate_prediction=round(base_open_rate, 2),
        deployment_time=datetime.utcnow().isoformat()
    )
