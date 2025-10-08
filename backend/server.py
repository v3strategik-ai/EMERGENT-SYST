from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# ==================== MODELS ====================

class UserRole(BaseModel):
    EMPLOYEE: str = "employee"
    ADMIN: str = "admin"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # "employee" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "employee"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class StatusCategory(BaseModel):
    SYSTEM: str = "System"
    APPLICATION: str = "Application"
    DATABASE: str = "Database"
    NETWORK: str = "Network"
    SECURITY: str = "Security"
    OTHER: str = "Other"

class StatusPriority(BaseModel):
    LOW: str = "Low"
    MEDIUM: str = "Medium"
    HIGH: str = "High"
    CRITICAL: str = "Critical"

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str = "System"
    priority: str = "Medium"
    status_type: str = "Operational"  # Operational, Degraded, Down
    user_id: str
    user_name: str
    user_email: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    title: str
    description: str
    category: str = "System"
    priority: str = "Medium"
    status_type: str = "Operational"

class StatusCheckUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status_type: Optional[str] = None

class AnalyticsResponse(BaseModel):
    total_checks: int
    total_users: int
    checks_by_status: dict
    checks_by_priority: dict
    checks_by_category: dict
    recent_activity: List[StatusCheck]

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Convert ISO string timestamp back to datetime if needed
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role if user_data.role in ["employee", "admin"] else "employee"
    )
    
    # Store in database
    user_dict = user.model_dump()
    user_dict['password'] = hashed_password
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Convert ISO string timestamp back to datetime
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    # Remove password from response
    user_doc.pop('password', None)
    user_doc.pop('_id', None)
    user = User(**user_doc)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== STATUS CHECK ENDPOINTS ====================

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(
    input: StatusCheckCreate,
    current_user: User = Depends(get_current_user)
):
    status_dict = input.model_dump()
    status_obj = StatusCheck(
        **status_dict,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email
    )
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks(
    current_user: User = Depends(get_current_user),
    category: Optional[str] = None,
    priority: Optional[str] = None,
    status_type: Optional[str] = None,
    limit: int = 100
):
    # Build query
    query = {}
    
    # If employee, only show their own checks
    if current_user.role == "employee":
        query["user_id"] = current_user.id
    
    # Apply filters
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if status_type:
        query["status_type"] = status_type
    
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.get("/status/my", response_model=List[StatusCheck])
async def get_my_status_checks(current_user: User = Depends(get_current_user)):
    status_checks = await db.status_checks.find(
        {"user_id": current_user.id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.get("/status/{status_id}", response_model=StatusCheck)
async def get_status_check(
    status_id: str,
    current_user: User = Depends(get_current_user)
):
    status_check = await db.status_checks.find_one({"id": status_id}, {"_id": 0})
    
    if not status_check:
        raise HTTPException(status_code=404, detail="Status check not found")
    
    # Check permissions
    if current_user.role == "employee" and status_check["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if isinstance(status_check['timestamp'], str):
        status_check['timestamp'] = datetime.fromisoformat(status_check['timestamp'])
    
    return StatusCheck(**status_check)

@api_router.put("/status/{status_id}", response_model=StatusCheck)
async def update_status_check(
    status_id: str,
    update_data: StatusCheckUpdate,
    current_user: User = Depends(get_current_user)
):
    # Find existing check
    existing = await db.status_checks.find_one({"id": status_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Status check not found")
    
    # Check permissions
    if current_user.role == "employee" and existing["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update only provided fields
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        await db.status_checks.update_one({"id": status_id}, {"$set": update_dict})
    
    # Get updated document
    updated = await db.status_checks.find_one({"id": status_id}, {"_id": 0})
    if isinstance(updated['timestamp'], str):
        updated['timestamp'] = datetime.fromisoformat(updated['timestamp'])
    
    return StatusCheck(**updated)

@api_router.delete("/status/{status_id}")
async def delete_status_check(
    status_id: str,
    current_user: User = Depends(get_current_user)
):
    # Find existing check
    existing = await db.status_checks.find_one({"id": status_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Status check not found")
    
    # Check permissions
    if current_user.role == "employee" and existing["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.status_checks.delete_one({"id": status_id})
    return {"message": "Status check deleted successfully"}

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@api_router.get("/admin/analytics", response_model=AnalyticsResponse)
async def get_analytics(current_user: User = Depends(get_admin_user)):
    # Get total counts
    total_checks = await db.status_checks.count_documents({})
    total_users = await db.users.count_documents({})
    
    # Get all checks for aggregation
    all_checks = await db.status_checks.find({}, {"_id": 0}).to_list(10000)
    
    # Aggregate by status type
    checks_by_status = {}
    checks_by_priority = {}
    checks_by_category = {}
    
    for check in all_checks:
        # By status type
        status = check.get('status_type', 'Unknown')
        checks_by_status[status] = checks_by_status.get(status, 0) + 1
        
        # By priority
        priority = check.get('priority', 'Unknown')
        checks_by_priority[priority] = checks_by_priority.get(priority, 0) + 1
        
        # By category
        category = check.get('category', 'Unknown')
        checks_by_category[category] = checks_by_category.get(category, 0) + 1
    
    # Get recent activity (last 10 checks)
    recent = await db.status_checks.find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
    for check in recent:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return AnalyticsResponse(
        total_checks=total_checks,
        total_users=total_users,
        checks_by_status=checks_by_status,
        checks_by_priority=checks_by_priority,
        checks_by_category=checks_by_category,
        recent_activity=[StatusCheck(**check) for check in recent]
    )

# ==================== BASIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Status Monitoring API - v1.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()