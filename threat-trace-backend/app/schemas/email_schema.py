from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import datetime

class EmailAnalysisRequest(BaseModel):
    rawText: str
    fileName: Optional[str] = "Pasted_Email.eml"

class EmailSummary(BaseModel):
    id: str
    subject: str
    sender: str
    recipient: str
    date: str
    riskScore: int
    classification: str
    confidence: float
    created_at: str

class EmailDetailResponse(BaseModel):
    id: str
    fileInfo: Dict[str, Any]
    threatScore: Dict[str, Any]
    authentication: Dict[str, Any]
    hops: List[Dict[str, Any]]
    iocs: Dict[str, Any]
    rawHeaders: str
    parsedAt: str
