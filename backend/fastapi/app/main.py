from fastapi import FastAPI
from app.routers.ecommerce import inventory, shipping
from app.routers.marketing import campaign
from app.routers.devops import deployment
import uvicorn
from app.api import ai_architect

app = FastAPI(
    title="Workflow Automation Worker",
    description="Microservice for executing business logic in the Workflow Automation Platform.",
    version="1.0.0"
)

# Register Routers
# Note: prefixes should match the requirements
# E-Commerce: /ecommerce/inventory/check, /ecommerce/shipping/label
app.include_router(inventory.router, prefix="/ecommerce", tags=["E-Commerce"])
app.include_router(shipping.router, prefix="/ecommerce", tags=["E-Commerce"])

# Marketing: /marketing/campaign/send
app.include_router(campaign.router, prefix="/marketing", tags=["Marketing"])

# DevOps: /devops/deployment/trigger
app.include_router(deployment.router, prefix="/devops", tags=["DevOps"])

app.include_router(ai_architect.router, prefix="/ai", tags=["AI Architect"])

def read_root():
    return {"message": "Orvexia Worker is running"}

@app.get("/")
async def root():
    return {"message": "Workflow Automation Worker is running", "docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

