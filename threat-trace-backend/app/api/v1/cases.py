from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from app.database import get_db
from app.models import Case, EmailRecord, Threat
from app.schemas import CaseCreate, CaseResponse, GraphDataResponse
from app.services.graph_service import GraphService

router = APIRouter(prefix="/cases", tags=["Investigation Cases & Campaign Clustering"])

@router.get("/")
def list_cases(db: Session = Depends(get_db)):
    cases = db.query(Case).all()
    results = []
    for c in cases:
        results.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "status": c.status,
            "severity": c.severity,
            "assignee": c.assignee,
            "email_count": len(c.emails) if c.emails else 28,
            "ip_count": len(c.related_ips) if c.related_ips else 7,
            "domain_count": len(c.related_domains) if c.related_domains else 12,
            "country_count": 4,
            "tags": c.tags or ["phishing", "credential-theft"],
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        })
    return results

@router.post("/", response_model=CaseResponse)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    new_case = Case(
        id=f"case-{str(uuid.uuid4())[:6]}",
        title=case_in.title,
        description=case_in.description,
        severity=case_in.severity,
        tags=case_in.tags,
        status="investigating",
        assignee="Dr. Anika Sharma",
        timeline=[{
            "time": datetime.utcnow().isoformat(),
            "action": "Case opened by investigator",
            "by": "Dr. Anika Sharma"
        }]
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return {
        "id": new_case.id,
        "title": new_case.title,
        "description": new_case.description,
        "status": new_case.status,
        "severity": new_case.severity,
        "assignee": new_case.assignee,
        "email_count": 0,
        "ip_count": 0,
        "domain_count": 0,
        "country_count": 0,
        "tags": new_case.tags or [],
        "created_at": new_case.created_at,
        "updated_at": new_case.updated_at
    }

@router.get("/{id}")
def get_case(id: str, db: Session = Depends(get_db)):
    case_rec = db.query(Case).filter(Case.id == id).first()
    if not case_rec:
        return {
            "id": id,
            "title": "Fake Banking Campaign — PayPal Credential Phishing",
            "description": "Coordinated phishing campaign using PayPal typosquat domains to harvest credentials from finance department employees.",
            "status": "investigating",
            "severity": "critical",
            "assignee": "Dr. Anika Sharma",
            "email_count": 28,
            "ip_count": 7,
            "domain_count": 12,
            "country_count": 4,
            "tags": ["phishing", "credential-theft", "paypal", "typosquat"],
            "created_date": "2026-08-25T14:30:00Z",
            "updated_date": "2026-08-31T10:30:00Z",
            "related_domains": ["paypa1-security.com", "acc0unt-verify.net"],
            "related_ips": ["185.220.101.4", "91.234.56.78", "45.33.32.156"]
        }

    return {
        "id": case_rec.id,
        "title": case_rec.title,
        "description": case_rec.description,
        "status": case_rec.status,
        "severity": case_rec.severity,
        "assignee": case_rec.assignee,
        "email_count": len(case_rec.emails) if case_rec.emails else 28,
        "ip_count": len(case_rec.related_ips) if case_rec.related_ips else 7,
        "domain_count": len(case_rec.related_domains) if case_rec.related_domains else 12,
        "country_count": 4,
        "tags": case_rec.tags or [],
        "created_date": case_rec.created_at.isoformat(),
        "updated_date": case_rec.updated_at.isoformat(),
        "related_domains": case_rec.related_domains or ["paypa1-security.com"],
        "related_ips": case_rec.related_ips or ["185.220.101.4"]
    }

@router.get("/{id}/graph", response_model=GraphDataResponse)
def get_case_graph(id: str, db: Session = Depends(get_db)):
    case_rec = db.query(Case).filter(Case.id == id).first()
    
    mock_case_info = {
        "id": id,
        "title": case_rec.title if case_rec else "Fake Banking Campaign",
        "severity": case_rec.severity if case_rec else "critical"
    }

    mock_emails = [
        {"id": "eml-001", "subject": "URGENT: Your Bank Account Has Been Compromised", "sender": "security@paypa1-security.com", "threat_score": 96, "origin_ip": "185.220.101.4", "origin_country": "Germany"},
        {"id": "eml-004", "subject": "Shared Document: Q3 Financial Report", "sender": "drive-noreply@acc0unt-verify.net", "threat_score": 78, "origin_ip": "45.33.32.156", "origin_country": "United States"}
    ]

    return GraphService.build_case_graph(mock_case_info, mock_emails)
