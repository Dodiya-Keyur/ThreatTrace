from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EmailRecord, Threat

router = APIRouter(prefix="/forensics", tags=["Email Forensics & Protocol Inspection"])

@router.get("/{email_id}/headers")
def get_email_headers(email_id: str, db: Session = Depends(get_db)):
    email_rec = db.query(EmailRecord).filter(EmailRecord.id == email_id).first()
    if not email_rec:
        raise HTTPException(status_code=404, detail="Email record not found")
    
    return {
        "email_id": email_rec.id,
        "from": email_rec.sender,
        "reply_to": email_rec.reply_to,
        "return_path": email_rec.return_path,
        "message_id": email_rec.message_id,
        "raw_headers": email_rec.raw_headers
    }

@router.get("/{email_id}/relay-path")
def get_relay_path(email_id: str, db: Session = Depends(get_db)):
    threat = db.query(Threat).filter(Threat.email_id == email_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Forensic relay record not found")
    
    return {
        "email_id": email_id,
        "origin_ip": threat.origin_ip,
        "origin_country": threat.origin_country,
        "received_chain": threat.received_chain
    }

@router.get("/{email_id}/authentication")
def get_authentication_results(email_id: str, db: Session = Depends(get_db)):
    threat = db.query(Threat).filter(Threat.email_id == email_id).first()
    if not threat:
        raise HTTPException(status_code=404, detail="Authentication record not found")
    
    return {
        "email_id": email_id,
        "authentication": threat.authentication
    }
