from pydantic import BaseModel,Field
from typing import List,Optional,Dict,Any

class ReactFlowNodeData(BaseModel):
    label: str=Field(description="The visible name of the model")
    serviceUrl: Optional[str]=Field(description="The backend URL if this is the service task")
    payload: Dict[str,Any]=Field(default_factory=dict,description="Configuration data for the node")

class ReactFlowNode(BaseModel):
    id:str=Field(description="Unique Node ID")
    type:str=Field(description="Must be one of: start_trigger")
    position: Dict[str,int]=Field(description="Visual cooordinates {'x':int and 'y':int}")
    data: ReactFlowNodeData

class ReactFlowEdge(BaseModel):
    id: str=Field(description="Unique edge ID")
    source: str=Field(description="Source Node ID")
    target: str=Field(description="Target Node ID")

class WorkflowDefinition(BaseModel):
    """The structure the AI must return"""
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]
    summary: str=Field(description="Short summary of what was built")

class HistoryItem(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[HistoryItem]=[]