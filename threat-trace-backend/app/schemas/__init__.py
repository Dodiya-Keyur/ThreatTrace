from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    organization: Optional[str] = "Acme Corp SOC"
    role: Optional[str] = "Lead Security Analyst"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Email & Forensics Schemas ---
class EmailAnalyzeRequest(BaseModel):
    raw_content: Optional[str] = None
    options: Optional[Dict[str, bool]] = {
        "whois": True,
        "virusTotal": True,
        "geolocate": True
    }

class AuthProtocolResult(BaseModel):
    status: str
    detail: str
    domain: Optional[str] = ""
    selector: Optional[str] = None
    policy: Optional[str] = None

class ReceivedHop(BaseModel):
    hop: int
    from_host: str
    by_host: str
    ip: str
    timestamp: str
    delay: str
    anomaly: Optional[str] = None

class Indicator(BaseModel):
    type: str
    label: str
    detected: bool
    detail: str

class ThreatResponse(BaseModel):
    id: str
    email_id: str
    subject: str
    sender: str
    sender_display: str
    recipient: str
    reply_to: str
    return_path: str
    message_id: str
    date: str
    body_preview: str
    threat_score: int
    classification: str
    severity: str
    status: str
    indicators: List[Indicator]
    nlp_analysis: Dict[str, int]
    authentication: Dict[str, Any]
    received_chain: List[ReceivedHop]
    origin_ip: str
    origin_country: str
    urls: List[Dict[str, Any]]
    attachments: List[Dict[str, Any]]
    raw_headers: str
    class Config:
        from_attributes = True

# --- Case & Intelligence Schemas ---
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    severity: Optional[str] = "critical"
    tags: Optional[List[str]] = []

class CaseResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    severity: str
    assignee: str
    email_count: int
    ip_count: int
    domain_count: int
    country_count: int
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    data: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str

class GraphDataResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class AlertResponse(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    email_id: Optional[str] = None
    case_id: Optional[str] = None
    read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class EvidenceResponse(BaseModel):
    id: str
    case_id: Optional[str]
    filename: str
    evidence_type: str
    sha256: str
    collected_by: str
    collected_date: datetime
    status: str
    audit_trail: List[Dict[str, Any]]
    class Config:
        from_attributes = True
