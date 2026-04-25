from pydantic import Field
from .shared import BaseAPIModel

class CampaignSendRequest(BaseAPIModel):
    subject: str
    recipient_count: int = Field(..., gt=0)

class CampaignSendResponse(BaseAPIModel):
    emails_sent: int
    open_rate_prediction: float = Field(..., description="Predicted open rate (0.0 - 1.0)")
    deployment_time: str
