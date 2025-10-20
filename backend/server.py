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
from datetime import datetime, timezone, timedelta, date
from routes import integrations
from routes import advanced_ai
import bcrypt
import jwt
from ai_copilot import AICopilot
from models import (
    Lead, LeadCreate, LeadUpdate,
    Workflow, WorkflowCreate, WorkflowUpdate,
    Quote, QuoteCreate, QuoteUpdate,
    Document, DocumentCreate,
    Transaction, TransactionCreate,
    DashboardStats
)

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
    except jwt.PyJWTError:
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

@api_router.get("/admin/users")
async def get_all_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    users = await db.users.find(query, {"_id": 0, "password": 0}).sort("created_at", -1).to_list(1000)
    
    # Convert ISO strings to datetime objects
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {"users": users}

@api_router.put("/admin/users/{user_id}/promote")
async def promote_user_to_admin(user_id: str, current_user: User = Depends(get_current_user)):
    """Promote a user to admin role - only admins can do this"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Update user role to admin
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User promoted to admin successfully", "user_id": user_id}

@api_router.put("/admin/users/{user_id}/demote")
async def demote_admin_user(user_id: str, current_user: User = Depends(get_current_user)):
    """Demote an admin user to employee role - only admins can do this"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Prevent self-demotion
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot demote yourself")
    
    # Update user role to employee
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": "employee"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User demoted to employee successfully", "user_id": user_id}

@api_router.post("/admin/assign-first-admin")
async def assign_first_admin():
    """Assign first admin - only works if no admins exist"""
    
    # Check if any admin users exist
    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin users already exist")
    
    # Get the first user (oldest account) and make them admin
    first_user = await db.users.find_one({}, {"_id": 0}, sort=[("created_at", 1)])
    if not first_user:
        raise HTTPException(status_code=404, detail="No users found")
    
    # Update first user to admin
    await db.users.update_one(
        {"id": first_user["id"]},
        {"$set": {"role": "admin"}}
    )
    
    return {
        "message": "First admin assigned successfully",
        "admin_user": {
            "id": first_user["id"],
            "name": first_user["name"],
            "email": first_user["email"]
        }
    }

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

# ==================== AI COPILOT MODELS ====================

class AIQuery(BaseModel):
    query: str
    session_id: Optional[str] = None

class AIResponse(BaseModel):
    response: str
    session_id: str

class DataAnalysisRequest(BaseModel):
    data: dict
    question: str

# ==================== AI COPILOT ENDPOINTS ====================

ai_copilot = AICopilot()

@api_router.post("/ai/query", response_model=AIResponse)
async def ai_query(request: AIQuery, current_user: User = Depends(get_current_user)):
    """Process AI query through the copilot"""
    session_id = request.session_id or str(uuid.uuid4())
    response = await ai_copilot.process_query(request.query, session_id)
    return AIResponse(response=response, session_id=session_id)

@api_router.post("/ai/analyze")
async def ai_analyze(request: DataAnalysisRequest, current_user: User = Depends(get_current_user)):
    """Analyze data with AI"""
    response = await ai_copilot.analyze_data(request.data, request.question)
    return {"analysis": response}

@api_router.post("/ai/report/{report_type}")
async def ai_generate_report(
    report_type: str,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """Generate AI-powered business reports"""
    response = await ai_copilot.generate_report(report_type, data)
    return {"report": response}

# ==================== CRM ENDPOINTS ====================

@api_router.post("/crm/leads", response_model=Lead)
async def create_lead(lead_data: LeadCreate, current_user: User = Depends(get_current_user)):
    lead = Lead(
        **lead_data.model_dump(),
        assigned_to=current_user.name,
        user_id=current_user.id
    )
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.leads.insert_one(doc)
    return lead

@api_router.get("/crm/leads", response_model=List[Lead])
async def get_leads(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for lead in leads:
        if isinstance(lead.get('created_at'), str):
            lead['created_at'] = datetime.fromisoformat(lead['created_at'])
        if isinstance(lead.get('updated_at'), str):
            lead['updated_at'] = datetime.fromisoformat(lead['updated_at'])
    return leads

@api_router.put("/crm/leads/{lead_id}", response_model=Lead)
async def update_lead(lead_id: str, update_data: LeadUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    await db.leads.update_one({"id": lead_id}, {"$set": update_dict})
    updated = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if updated:
        if isinstance(updated.get('created_at'), str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if isinstance(updated.get('updated_at'), str):
            updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
        return Lead(**updated)
    raise HTTPException(status_code=404, detail="Lead not found")

@api_router.delete("/crm/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: User = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}

# ==================== WORKFLOW ENDPOINTS ====================

@api_router.post("/automation/workflows", response_model=Workflow)
async def create_workflow(workflow_data: WorkflowCreate, current_user: User = Depends(get_current_user)):
    workflow = Workflow(**workflow_data.model_dump(), user_id=current_user.id)
    doc = workflow.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_run'):
        doc['last_run'] = doc['last_run'].isoformat()
    await db.workflows.insert_one(doc)
    return workflow

@api_router.get("/automation/workflows", response_model=List[Workflow])
async def get_workflows(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    workflows = await db.workflows.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for workflow in workflows:
        if isinstance(workflow.get('created_at'), str):
            workflow['created_at'] = datetime.fromisoformat(workflow['created_at'])
        if workflow.get('last_run') and isinstance(workflow.get('last_run'), str):
            workflow['last_run'] = datetime.fromisoformat(workflow['last_run'])
    return workflows

@api_router.put("/automation/workflows/{workflow_id}", response_model=Workflow)
async def update_workflow(workflow_id: str, update_data: WorkflowUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    await db.workflows.update_one({"id": workflow_id}, {"$set": update_dict})
    updated = await db.workflows.find_one({"id": workflow_id}, {"_id": 0})
    if updated:
        if isinstance(updated.get('created_at'), str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if updated.get('last_run') and isinstance(updated.get('last_run'), str):
            updated['last_run'] = datetime.fromisoformat(updated['last_run'])
        return Workflow(**updated)
    raise HTTPException(status_code=404, detail="Workflow not found")

@api_router.delete("/automation/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str, current_user: User = Depends(get_current_user)):
    result = await db.workflows.delete_one({"id": workflow_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

# ==================== QUOTE ENDPOINTS ====================

@api_router.post("/cpq/quotes", response_model=Quote)
async def create_quote(quote_data: QuoteCreate, current_user: User = Depends(get_current_user)):
    # Calculate totals
    subtotal = sum(item['quantity'] * item['price'] for item in quote_data.items)
    tax = subtotal * quote_data.tax_rate
    total = subtotal + tax
    
    # Generate quote number
    count = await db.quotes.count_documents({})
    quote_number = f"Q-2025-{count + 1:04d}"
    
    quote = Quote(
        quote_number=quote_number,
        client_name=quote_data.client_name,
        client_email=quote_data.client_email,
        items=quote_data.items,
        subtotal=subtotal,
        tax=tax,
        total=total,
        valid_until=datetime.now(timezone.utc) + timedelta(days=30),
        user_id=current_user.id
    )
    doc = quote.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['valid_until'] = doc['valid_until'].isoformat()
    await db.quotes.insert_one(doc)
    return quote

@api_router.get("/cpq/quotes", response_model=List[Quote])
async def get_quotes(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    quotes = await db.quotes.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for quote in quotes:
        if isinstance(quote.get('created_at'), str):
            quote['created_at'] = datetime.fromisoformat(quote['created_at'])
        if isinstance(quote.get('valid_until'), str):
            quote['valid_until'] = datetime.fromisoformat(quote['valid_until'])
    return quotes

@api_router.put("/cpq/quotes/{quote_id}", response_model=Quote)
async def update_quote(quote_id: str, update_data: QuoteUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    await db.quotes.update_one({"id": quote_id}, {"$set": update_dict})
    updated = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if updated:
        if isinstance(updated.get('created_at'), str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if isinstance(updated.get('valid_until'), str):
            updated['valid_until'] = datetime.fromisoformat(updated['valid_until'])
        return Quote(**updated)
    raise HTTPException(status_code=404, detail="Quote not found")

@api_router.delete("/cpq/quotes/{quote_id}")
async def delete_quote(quote_id: str, current_user: User = Depends(get_current_user)):
    result = await db.quotes.delete_one({"id": quote_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted successfully"}

# ==================== DOCUMENT ENDPOINTS ====================

@api_router.post("/documents", response_model=Document)
async def create_document(doc_data: DocumentCreate, current_user: User = Depends(get_current_user)):
    document = Document(**doc_data.model_dump(), user_id=current_user.id)
    doc = document.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.documents.insert_one(doc)
    return document

@api_router.get("/documents", response_model=List[Document])
async def get_documents(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    documents = await db.documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for document in documents:
        if isinstance(document.get('created_at'), str):
            document['created_at'] = datetime.fromisoformat(document['created_at'])
    return documents

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: User = Depends(get_current_user)):
    result = await db.documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}

# ==================== TRANSACTION ENDPOINTS ====================

@api_router.post("/payments/transactions", response_model=Transaction)
async def create_transaction(trans_data: TransactionCreate, current_user: User = Depends(get_current_user)):
    count = await db.transactions.count_documents({})
    trans_id = f"TRX-{count + 1:05d}"
    
    transaction = Transaction(
        transaction_id=trans_id,
        **trans_data.model_dump(),
        user_id=current_user.id
    )
    doc = transaction.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.transactions.insert_one(doc)
    return transaction

@api_router.get("/payments/transactions", response_model=List[Transaction])
async def get_transactions(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    transactions = await db.transactions.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for transaction in transactions:
        if isinstance(transaction.get('created_at'), str):
            transaction['created_at'] = datetime.fromisoformat(transaction['created_at'])
    return transactions

# ==================== SALES SUITE MODELS ====================

class DealCreate(BaseModel):
    name: str
    company: str
    value: float
    status: str = "Prospecting"
    source: str
    close_date: Optional[date] = None
    probability: Optional[int] = 50

class Deal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    company: str
    value: float
    status: str
    source: str
    close_date: Optional[date]
    probability: int
    assigned_to: str
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DealUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    value: Optional[float] = None
    status: Optional[str] = None
    source: Optional[str] = None
    close_date: Optional[date] = None
    probability: Optional[int] = None

# ==================== SALES SUITE ENDPOINTS ====================

@api_router.post("/sales/deals", response_model=Deal)
async def create_deal(deal_data: DealCreate, current_user: User = Depends(get_current_user)):
    deal = Deal(
        **deal_data.model_dump(),
        assigned_to=current_user.name,
        user_id=current_user.id
    )
    doc = deal.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    if doc.get('close_date'):
        doc['close_date'] = doc['close_date'].isoformat()
    await db.deals.insert_one(doc)
    return deal

@api_router.get("/sales/deals", response_model=List[Deal])
async def get_deals(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    deals = await db.deals.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for deal in deals:
        if isinstance(deal.get('created_at'), str):
            deal['created_at'] = datetime.fromisoformat(deal['created_at'])
        if isinstance(deal.get('updated_at'), str):
            deal['updated_at'] = datetime.fromisoformat(deal['updated_at'])
        if deal.get('close_date') and isinstance(deal['close_date'], str):
            deal['close_date'] = datetime.fromisoformat(deal['close_date']).date()
    return deals

@api_router.put("/sales/deals/{deal_id}", response_model=Deal)
async def update_deal(deal_id: str, update_data: DealUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    if update_dict.get('close_date'):
        update_dict['close_date'] = update_dict['close_date'].isoformat()
    await db.deals.update_one({"id": deal_id}, {"$set": update_dict})
    updated = await db.deals.find_one({"id": deal_id}, {"_id": 0})
    if updated:
        if isinstance(updated.get('created_at'), str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        if isinstance(updated.get('updated_at'), str):
            updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
        if updated.get('close_date') and isinstance(updated['close_date'], str):
            updated['close_date'] = datetime.fromisoformat(updated['close_date']).date()
        return Deal(**updated)
    raise HTTPException(status_code=404, detail="Deal not found")

@api_router.delete("/sales/deals/{deal_id}")
async def delete_deal(deal_id: str, current_user: User = Depends(get_current_user)):
    result = await db.deals.delete_one({"id": deal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"message": "Deal deleted successfully"}

# ==================== FINANCE SUITE MODELS ====================

class ReportCreate(BaseModel):
    name: str
    report_type: str  # 'P&L', 'Cash Flow', 'Balance Sheet', 'Budget'
    period: str  # 'Monthly', 'Quarterly', 'Yearly'
    data: dict

class FinanceReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    report_type: str
    period: str
    data: dict
    status: str = "Generated"
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    data: Optional[dict] = None

# ==================== FINANCE SUITE ENDPOINTS ====================

@api_router.post("/finance/reports", response_model=FinanceReport)
async def create_finance_report(report_data: ReportCreate, current_user: User = Depends(get_current_user)):
    report = FinanceReport(
        **report_data.model_dump(),
        user_id=current_user.id
    )
    doc = report.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.finance_reports.insert_one(doc)
    return report

@api_router.get("/finance/reports", response_model=List[FinanceReport])
async def get_finance_reports(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    reports = await db.finance_reports.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for report in reports:
        if isinstance(report.get('created_at'), str):
            report['created_at'] = datetime.fromisoformat(report['created_at'])
    return reports

@api_router.put("/finance/reports/{report_id}", response_model=FinanceReport)
async def update_finance_report(report_id: str, update_data: ReportUpdate, current_user: User = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    await db.finance_reports.update_one({"id": report_id}, {"$set": update_dict})
    updated = await db.finance_reports.find_one({"id": report_id}, {"_id": 0})
    if updated:
        if isinstance(updated.get('created_at'), str):
            updated['created_at'] = datetime.fromisoformat(updated['created_at'])
        return FinanceReport(**updated)
    raise HTTPException(status_code=404, detail="Report not found")

@api_router.delete("/finance/reports/{report_id}")
async def delete_finance_report(report_id: str, current_user: User = Depends(get_current_user)):
    result = await db.finance_reports.delete_one({"id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"message": "Report deleted successfully"}

# ==================== ANALYTICS SUITE MODELS ====================

class DashboardCreate(BaseModel):
    name: str
    dashboard_type: str  # 'Real-time', 'Daily', 'Weekly', 'Custom'
    widgets: List[dict] = []
    config: dict = {}

class AnalyticsDashboard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    dashboard_type: str
    widgets: List[dict]
    config: dict
    active: bool = True
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    widgets: Optional[List[dict]] = None
    config: Optional[dict] = None
    active: Optional[bool] = None

# ==================== ANALYTICS SUITE ENDPOINTS ====================

@api_router.post("/analytics/dashboards", response_model=AnalyticsDashboard)
async def create_analytics_dashboard(dashboard_data: DashboardCreate, current_user: User = Depends(get_current_user)):
    dashboard = AnalyticsDashboard(
        **dashboard_data.model_dump(),
        user_id=current_user.id
    )
    doc = dashboard.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.analytics_dashboards.insert_one(doc)
    return dashboard

@api_router.get("/analytics/dashboards", response_model=List[AnalyticsDashboard])
async def get_analytics_dashboards(current_user: User = Depends(get_current_user)):
    query = {} if current_user.role == "admin" else {"user_id": current_user.id}
    dashboards = await db.analytics_dashboards.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for dashboard in dashboards:
        if isinstance(dashboard.get('created_at'), str):
            dashboard['created_at'] = datetime.fromisoformat(dashboard['created_at'])
        if isinstance(dashboard.get('updated_at'), str):
            dashboard['updated_at'] = datetime.fromisoformat(dashboard['updated_at'])
    return dashboards

@api_router.get("/analytics/data/{data_type}")
async def get_analytics_data(data_type: str, current_user: User = Depends(get_current_user)):
    """Get analytics data for various metrics"""
    if data_type == "sales":
        # Get sales analytics
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        deals = await db.deals.find(query, {"_id": 0}).to_list(1000)
        total_value = sum(deal.get('value', 0) for deal in deals)
        won_deals = [d for d in deals if d.get('status') == 'Closed Won']
        return {
            "total_deals": len(deals),
            "total_value": total_value,
            "won_deals": len(won_deals),
            "conversion_rate": len(won_deals) / len(deals) * 100 if deals else 0
        }
    elif data_type == "crm":
        # Get CRM analytics
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        leads = await db.leads.find(query, {"_id": 0}).to_list(1000)
        qualified_leads = [l for l in leads if l.get('status') == 'Qualified']
        return {
            "total_leads": len(leads),
            "qualified_leads": len(qualified_leads),
            "qualification_rate": len(qualified_leads) / len(leads) * 100 if leads else 0
        }
    elif data_type == "finance":
        # Get finance analytics
        query = {} if current_user.role == "admin" else {"user_id": current_user.id}
        transactions = await db.transactions.find(query, {"_id": 0}).to_list(1000)
        total_revenue = sum(t.get('amount', 0) for t in transactions if t.get('status') == 'Completed')
        return {
            "total_transactions": len(transactions),
            "total_revenue": total_revenue,
            "avg_transaction": total_revenue / len(transactions) if transactions else 0
        }
    else:
        return {"error": "Unknown data type"}

# ==================== BASIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Agentik Solutions - Business Intelligence API v2.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)
app.include_router(integrations.router)
app.include_router(advanced_ai.router)

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