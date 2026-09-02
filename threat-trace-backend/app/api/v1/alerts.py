from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime
from typing import List

from app.database import get_db
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["Threat Alerts"])

INITIAL_ALERTS_SEED = [
    {
        "id": "ALT-1001",
        "alert_code": "ALT-1001",
        "title": "Executive Display Name Impersonation Detected",
        "sender": "j.davis-exec@payroll-update-sec.com",
        "risk_score": 94,
        "severity": "CRITICAL",
        "alert_type": "IMPERSONATION",
        "status": "UNRESOLVED",
        "email_id": "email-101",
        "created_at": datetime.datetime.utcnow()
    },
    {
        "id": "ALT-1002",
        "alert_code": "ALT-1002",
        "title": "PayPal Credential Harvesting Attempt",
        "sender": "service@pаypal-security-auth.com",
        "risk_score": 78,
        "severity": "HIGH",
        "alert_type": "PHISHING",
        "status": "UNRESOLVED",
        "email_id": "email-102",
        "created_at": datetime.datetime.utcnow()
    },
    {
        "id": "ALT-1003",
        "alert_code": "ALT-1003",
        "title": "Double Extension Executable Attachment (.pdf.exe)",
        "sender": "accounts@global-vendor-billing-services.com",
        "risk_score": 91,
        "severity": "CRITICAL",
        "alert_type": "MALWARE_DROPPER",
        "status": "UNRESOLVED",
        "email_id": "email-103",
        "created_at": datetime.datetime.utcnow()
    }
]

@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    if not alerts:
        for a_seed in INITIAL_ALERTS_SEED:
            db.add(Alert(**a_seed))
        db.commit()
        alerts = db.query(Alert).all()

    return [
        {
            "id": a.id,
            "title": a.title,
            "sender": a.sender,
            "riskScore": a.risk_score,
            "severity": a.severity,
            "status": a.status,
            "type": a.alert_type,
            "emailId": a.email_id,
            "detectedAt": "Just now"
        }
        for a in alerts
    ]

@router.patch("/{alert_id}/status")
def update_alert_status(alert_id: str, status: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = status
        db.commit()
    return {"id": alert_id, "status": status}
