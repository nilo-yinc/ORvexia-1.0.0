from pydantic import Field
from .shared import BaseAPIModel
from typing import Literal

class DeploymentTriggerRequest(BaseAPIModel):
    repo_url: str
    branch: str = Field(default="main")

class DeploymentTriggerResponse(BaseAPIModel):
    build_id: str
    server_ip: str
    status: Literal["success", "failure"]
