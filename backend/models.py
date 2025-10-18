from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# ==================== USER MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str  # "employee" or "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== CRM MODELS ====================

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    status: str = "Lead"  # Lead, Qualified, Discovery, Proposal, Negotiation, Closed Won, Closed Lost
    value: float
    source: str = "Website"
    assigned_to: str
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    value: float
    source: str = "Website"

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    value: Optional[float] = None
    source: Optional[str] = None

# ==================== WORKFLOW MODELS ====================

class Workflow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    status: str = "Active"  # Active, Paused, Draft
    trigger_type: str  # Time-based, Event-based, Manual
    action_type: str
    frequency: str = "Daily"
    last_run: Optional[datetime] = None
    run_count: int = 0
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkflowCreate(BaseModel):
    name: str
    description: str
    trigger_type: str
    action_type: str
    frequency: str = "Daily"

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    trigger_type: Optional[str] = None
    action_type: Optional[str] = None
    frequency: Optional[str] = None

# ==================== QUOTE MODELS ====================

class Quote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_number: str
    client_name: str
    client_email: EmailStr
    items: List[dict]
    subtotal: float
    tax: float
    total: float
    status: str = "Draft"  # Draft, Pending, Approved, Rejected
    valid_until: datetime
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuoteCreate(BaseModel):
    client_name: str
    client_email: EmailStr
    items: List[dict]
    tax_rate: float = 0.0

class QuoteUpdate(BaseModel):
    status: Optional[str] = None
    items: Optional[List[dict]] = None

# ==================== DOCUMENT MODELS ====================

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    file_type: str
    file_size: int
    category: str
    template_used: Optional[str] = None
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DocumentCreate(BaseModel):
    name: str
    file_type: str
    file_size: int
    category: str
    template_used: Optional[str] = None

# ==================== TRANSACTION MODELS ====================

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_id: str
    customer_name: str
    customer_email: EmailStr
    amount: float
    status: str = "Completed"  # Completed, Pending, Failed
    gateway: str  # Stripe, PayPal, Square
    payment_method: str = "Credit Card"
    user_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TransactionCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    amount: float
    gateway: str
    payment_method: str = "Credit Card"

# ==================== DASHBOARD MODELS ====================

class DashboardStats(BaseModel):
    total_revenue: float
    active_users: int
    conversion_rate: float
    system_efficiency: float
    ai_accuracy: float
    security_score: float
