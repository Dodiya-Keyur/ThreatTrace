from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import uuid

from app.database import get_db
from app.models import EmailRecord, Threat, Evidence, Alert, Case
from app.schemas import EmailAnalyzeRequest, ThreatResponse
from app.services.email_parser import EmailParser
from app.services.header_analyzer import HeaderAnalyzer
from app.services.nlp_engine import NLPEngine
from app.services.ml_classifier import MLClassifier
from app.services.ip_intelligence import IPIntelligence
from app.services.domain_intelligence import DomainIntelligence
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/emails", tags=["Email Forensics & Scanning"])

async def process_and_store_email(raw_content: str or bytes, filename: str, db: Session):
    # 1. Parse raw email
    parsed = EmailParser.parse_raw(raw_content)

    # 2. Analyze Header Chain & SPF/DKIM/DMARC
    header_res = HeaderAnalyzer.analyze_headers(parsed)

    # 3. NLP Analysis on text content
    nlp_res = NLPEngine.analyze_text(
        subject=parsed["subject"],
        body=parsed["body_text"],
        sender_display=parsed["sender_display"]
    )

    # 4. Domain & IP Intelligence
    sender_domain = parsed["sender"].split("@")[-1] if "@" in parsed["sender"] else "unknown.com"
    domain_res = DomainIntelligence.analyze_domain(sender_domain)
    ip_res = await IPIntelligence.get_ip_intel(header_res["origin_ip"])

    # 5. ML Threat Classification
    threat_score, classification, severity, indicators = MLClassifier.classify_email(
        parsed_email=parsed,
        header_analysis=header_res,
        nlp_analysis=nlp_res,
        domain_intel=domain_res
    )

    # 6. Store Email Record
    email_id = f"eml-{str(uuid.uuid4())[:8]}"
    email_record = EmailRecord(
        id=email_id,
        subject=parsed["subject"],
        sender=parsed["sender"],
        sender_display=parsed["sender_display"],
        recipient=parsed["recipient"],
        reply_to=parsed["reply_to"],
        return_path=parsed["return_path"],
        message_id=parsed["message_id"],
        body_text=parsed["body_text"],
        body_html=parsed["body_html"],
        raw_headers=parsed["raw_headers"],
        raw_eml=parsed["raw_eml"]
    )
    db.add(email_record)

    # 7. Store Threat Record
    threat_id = f"thr-{str(uuid.uuid4())[:8]}"
    threat_record = Threat(
        id=threat_id,
        email_id=email_id,
        threat_score=threat_score,
        classification=classification,
        severity=severity,
        status="detected",
        indicators=indicators,
        nlp_analysis=nlp_res,
        authentication=header_res["authentication"],
        received_chain=header_res["received_chain"],
        origin_ip=header_res["origin_ip"],
        origin_country=ip_res.get("country", "Unknown"),
        extracted_urls=parsed["urls"],
        extracted_attachments=parsed["attachments"]
    )
    db.add(threat_record)

    # 8. Store Evidence Record with SHA-256 hash
    evidence_data = EvidenceService.create_evidence_record(
        filename=filename,
        content=raw_content,
        collected_by="Dr. Anika Sharma",
        evidence_type="email_source"
    )
    evidence_record = Evidence(
        id=f"EV-{str(uuid.uuid4())[:6].upper()}",
        filename=evidence_data["filename"],
        evidence_type=evidence_data["evidence_type"],
        sha256=evidence_data["sha256"],
        collected_by=evidence_data["collected_by"],
        status=evidence_data["status"],
        audit_trail=evidence_data["audit_trail"]
    )
    db.add(evidence_record)

    # 9. Trigger Alert if High or Critical
    if severity in ["critical", "high"]:
        alert = Alert(
            id=f"alt-{str(uuid.uuid4())[:6]}",
            title=f"{classification.replace('_', ' ')} Detected: {parsed['subject'][:40]}...",
            description=f"Threat Score {threat_score}/100. Sender: {parsed['sender']}. Origin: {header_res['origin_ip']}.",
            severity=severity,
            email_id=email_id,
            read=False
        )
        db.add(alert)

    db.commit()
    db.refresh(email_record)
    db.refresh(threat_record)

    return {
        "id": threat_record.id,
        "email_id": email_record.id,
        "subject": email_record.subject,
        "sender": email_record.sender,
        "sender_display": email_record.sender_display,
        "recipient": email_record.recipient,
        "reply_to": email_record.reply_to,
        "return_path": email_record.return_path,
        "message_id": email_record.message_id,
        "date": email_record.date.isoformat(),
        "body_preview": email_record.body_text[:500],
        "threat_score": threat_record.threat_score,
        "classification": threat_record.classification,
        "severity": threat_record.severity,
        "status": threat_record.status,
        "indicators": threat_record.indicators,
        "nlp_analysis": threat_record.nlp_analysis,
        "authentication": threat_record.authentication,
        "received_chain": threat_record.received_chain,
        "origin_ip": threat_record.origin_ip,
        "origin_country": threat_record.origin_country,
        "urls": threat_record.extracted_urls,
        "attachments": threat_record.extracted_attachments,
        "raw_headers": email_record.raw_headers
    }

@router.post("/upload")
async def upload_email(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    result = await process_and_store_email(content, file.filename, db)
    return result

@router.post("/analyze")
async def analyze_raw_email(req: EmailAnalyzeRequest, db: Session = Depends(get_db)):
    if not req.raw_content:
        raise HTTPException(status_code=400, detail="raw_content is required")
    result = await process_and_store_email(req.raw_content, "raw_pasted_email.eml", db)
    return result

@router.get("/")
def list_emails(db: Session = Depends(get_db)):
    records = db.query(EmailRecord).all()
    return records
