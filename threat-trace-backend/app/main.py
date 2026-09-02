from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Case, Alert, Evidence, EmailRecord, Threat
from app.utils.security import get_password_hash
from datetime import datetime

# Initialize Database tables
Base.metadata.create_all(bind=engine)

def seed_database():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            analyst = User(
                id="usr-001",
                name="Dr. Anika Sharma",
                email="anika.sharma@acmecorp.com",
                hashed_password=get_password_hash("password"),
                role="Lead Security Analyst",
                organization="Acme Corp SOC"
            )
            db.add(analyst)

            case_1 = Case(
                id="case-1024",
                title="Fake Banking Campaign — PayPal Credential Phishing",
                description="Coordinated phishing campaign using PayPal typosquat domains to harvest credentials from finance department employees across multiple organizations.",
                status="investigating",
                severity="critical",
                assignee="Dr. Anika Sharma",
                tags=["phishing", "credential-theft", "paypal", "typosquat"],
                related_ips=["185.220.101.4", "91.234.56.78", "45.33.32.156"],
                related_domains=["paypa1-security.com", "acc0unt-verify.net", "paypa1-login.com"],
                timeline=[
                    {"time": "2026-08-25T14:30:00Z", "action": "Case created", "by": "Dr. Anika Sharma"},
                    {"time": "2026-08-26T09:00:00Z", "action": "First phishing email detected", "by": "System"},
                    {"time": "2026-08-27T14:30:00Z", "action": "IP geolocation traced to Frankfurt, DE", "by": "System"},
                    {"time": "2026-08-28T10:00:00Z", "action": "Domain WHOIS analyzed — 12-day-old typosquat", "by": "Dr. Anika Sharma"},
                    {"time": "2026-08-31T10:30:00Z", "action": "Investigation ongoing", "by": "Dr. Anika Sharma"}
                ]
            )
            db.add(case_1)

            alerts_data = [
                {
                    "id": "alt-001",
                    "title": "CEO Impersonation Detected",
                    "description": "Email from hr-payroll-update.net impersonating CEO John Mitchell requesting urgent wire transfer to accounts payable.",
                    "severity": "critical",
                    "case_id": "case-1024",
                    "read": False
                },
                {
                    "id": "alt-002",
                    "title": "Phishing URL with Active Credential Harvesting",
                    "description": "Malicious URL paypa1-security.com/verify redirects to IP-hosted PayPal login clone.",
                    "severity": "critical",
                    "case_id": "case-1024",
                    "read": False
                },
                {
                    "id": "alt-003",
                    "title": "DMARC Policy Failure — No Enforcement",
                    "description": "Sender domain paypa1-security.com has DMARC policy set to none.",
                    "severity": "high",
                    "case_id": "case-1024",
                    "read": True
                }
            ]
            for a in alerts_data:
                db.add(Alert(**a))

            ev = Evidence(
                id="EV-001",
                case_id="case-1024",
                filename="eml-001_raw_source.eml",
                evidence_type="email_source",
                sha256="a7f3b2c1d4e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2",
                collected_by="Dr. Anika Sharma",
                status="preserved",
                audit_trail=[
                    {"action": "Collected", "by": "Dr. Anika Sharma", "timestamp": "2026-08-31T10:25:00Z"},
                    {"action": "Hash verified", "by": "System", "timestamp": "2026-08-31T10:25:01Z"},
                    {"action": "Stored in evidence locker", "by": "System", "timestamp": "2026-08-31T10:25:02Z"}
                ]
            )
            db.add(ev)

            db.commit()
    except Exception as e:
        print(f"Seed DB notice: {e}")
    finally:
        db.close()

seed_database()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform REST API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1.auth import router as auth_router
from app.api.v1.emails import router as emails_router
from app.api.v1.threats import router as threats_router
from app.api.v1.forensics import router as forensics_router
from app.api.v1.intelligence import router as intelligence_router
from app.api.v1.cases import router as cases_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.reports import router as reports_router
from app.api.v1.evidence import router as evidence_router

api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(emails_router, prefix=api_prefix)
app.include_router(threats_router, prefix=api_prefix)
app.include_router(forensics_router, prefix=api_prefix)
app.include_router(intelligence_router, prefix=api_prefix)
app.include_router(cases_router, prefix=api_prefix)
app.include_router(alerts_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)
app.include_router(evidence_router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }
