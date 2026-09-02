from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.evidence import Evidence
from app.services.evidence_service import create_evidence_record

router = APIRouter(prefix="/evidence", tags=["Evidence & Chain of Custody"])

INITIAL_EVIDENCE_SEED = [
    {
        "id": "EV-001",
        "case_id": "CASE-1001",
        "filename": "Urgent_Wire_Request_CEO.eml",
        "evidence_type": "Original Email Payload (.eml)",
        "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "collected_by": "Alex Vance",
        "status": "Preserved"
    },
    {
        "id": "EV-002",
        "case_id": "CASE-1001",
        "filename": "headers_dump.txt",
        "evidence_type": "Parsed RFC 5322 MIME Headers",
        "sha256": "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        "collected_by": "ThreatTrace Engine",
        "status": "Preserved"
    },
    {
        "id": "EV-003",
        "case_id": "CASE-1001",
        "filename": "whois_185.220.101.4.json",
        "evidence_type": "Origin IP WHOIS & GeoLocation Record",
        "sha256": "8f4e2948102a9412e84128919241829102491298412094120491829104910294",
        "collected_by": "Alex Vance",
        "status": "Preserved"
    }
]

@router.get("")
def get_evidence_records(db: Session = Depends(get_db)):
    records = db.query(Evidence).all()
    if not records:
        for seed in INITIAL_EVIDENCE_SEED:
            db.add(Evidence(**seed))
        db.commit()
        records = db.query(Evidence).all()

    return [
        {
            "id": r.id,
            "filename": r.filename,
            "type": getattr(r, "artifact_type", getattr(r, "evidence_type", "email_source")),
            "uploadedBy": getattr(r, "uploaded_by", getattr(r, "collected_by", "Alex Vance")),
            "time": r.collected_date.strftime("%I:%M %p") if getattr(r, "collected_date", None) else "10:30 AM",
            "hash": getattr(r, "file_hash", getattr(r, "sha256", "")),
            "sha256": getattr(r, "sha256", getattr(r, "file_hash", "")),
            "status": getattr(r, "custody_status", getattr(r, "status", "Preserved"))
        }
        for r in records
    ]
