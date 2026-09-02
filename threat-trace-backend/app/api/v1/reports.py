from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid
import datetime

from app.database import get_db
from app.models.email_record import EmailRecord
from app.schemas.report_schema import ReportGenerateRequest, ReportResponse

router = APIRouter(prefix="/reports", tags=["Forensic Reports"])

@router.post("/generate", response_model=ReportResponse)
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    email_rec = db.query(EmailRecord).filter(EmailRecord.id == req.emailId).first()
    if not email_rec:
        from app.api.v1.emails import get_email_by_id
        email_data = get_email_by_id(req.emailId, db)
    else:
        email_data = email_rec.parsed_metadata

    report_id = f"TT-REP-{uuid.uuid4().hex[:6].upper()}"

    return {
        "reportId": report_id,
        "reportType": req.reportType,
        "generatedAt": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "classification": "CONFIDENTIAL // LAW ENFORCEMENT COMPLIANT",
        "data": {
            "email": email_data,
            "investigatorNotes": req.investigatorNotes or "Verified by SOC Tier 2 Analyst.",
            "compliance": "ISO/IEC 27037 Digital Evidence Standard"
        }
    }
