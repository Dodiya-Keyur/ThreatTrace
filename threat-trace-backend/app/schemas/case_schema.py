from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CaseCreate(BaseModel):
    title: str
    threat: Optional[str] = "Phishing"
    severity: Optional[str] = "HIGH"
    status: Optional[str] = "OPEN"
    assignedAnalyst: Optional[str] = "Alex Vance"
    relatedEmailId: Optional[str] = ""
    relatedIp: Optional[str] = ""
    relatedDomain: Optional[str] = ""

class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    threat: str
    severity: str
    status: str
    assignedAnalyst: str
    relatedEmailId: str
    relatedIp: str
    relatedDomain: str
    date: str
    created_at: str

class GraphResponse(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
