from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    # Fallback or error handling if env var is missing, though instructions say it's there
    logging.error("MONGO_URL not found in environment variables")
    mongo_url = "mongodb://localhost:27017" # Fallback for safety

client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'bug_agency')]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class LeadBase(BaseModel):
    email: EmailStr

class Lead(LeadBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    tier: str
    amount: float
    email: Optional[str] = None

class Order(OrderCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "completed"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Routes
@api_router.get("/")
async def root():
    return {"message": "BUG Agency API is running"}

@api_router.post("/leads", response_model=Lead)
async def create_lead(lead_in: LeadBase):
    # Check if email exists
    existing = await db.leads.find_one({"email": lead_in.email})
    if existing:
        return Lead(**existing)
    
    lead = Lead(**lead_in.dict())
    await db.leads.insert_one(lead.dict())
    return lead

@api_router.post("/orders", response_model=Order)
async def create_order(order_in: OrderCreate):
    order = Order(**order_in.dict())
    await db.orders.insert_one(order.dict())
    return order

@api_router.get("/status")
async def health_check():
    return {"status": "ok", "time": datetime.utcnow()}

# Include Router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
