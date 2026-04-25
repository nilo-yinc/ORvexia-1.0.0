from pydantic import BaseModel, Field
from datetime import datetime

class BaseAPIModel(BaseModel):
    """Base model with configuration for all schemas."""
    class Config:
        from_attributes = True
