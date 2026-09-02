from pydantic import BaseModel
from typing import Dict, Any, Optional

class ReportGenerateRequest(BaseModel):
    reportType: str
    emailId: str
    caseId: Optional[str] = None
    investigatorNotes: Optional[str] = ""

class ReportResponse(BaseModel):
    reportId: str
    reportType: str
    generatedAt: str
    classification: str
    data: Dict[str, Any]
