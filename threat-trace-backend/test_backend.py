import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.services.email_parser import EmailParser
from app.services.header_analyzer import HeaderAnalyzer
from app.services.nlp_engine import NLPEngine
from app.services.ml_classifier import MLClassifier
from app.services.domain_intelligence import DomainIntelligence
from app.services.ip_intelligence import IPIntelligence
from app.services.evidence_service import EvidenceService

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"].lower() == "operational"
    print("  [OK] Root Healthcheck Endpoint Passed")

def test_auth():
    res = client.post("/api/v1/auth/login", json={"email": "anika.sharma@acmecorp.com", "password": "password"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    print("  [OK] Authentication Login Passed")

def test_forensic_pipeline():
    sample_path = os.path.join(os.path.dirname(__file__), "samples", "paypal_credential_phishing.eml")
    with open(sample_path, "r", encoding="utf-8") as f:
        raw_eml = f.read()

    parsed = EmailParser.parse_raw(raw_eml)
    assert parsed["sender"] == "security@paypa1-security.com"
    headers_res = HeaderAnalyzer.analyze_headers(parsed)
    nlp_res = NLPEngine.analyze_text(parsed["subject"], parsed["body_text"], parsed["sender_display"])
    domain_res = DomainIntelligence.analyze_domain("paypa1-security.com")
    
    score, classification, severity, indicators = MLClassifier.classify_email(
        parsed, headers_res, nlp_res, domain_res
    )
    assert score >= 85
    assert classification == "PHISHING"
    print(f"  [OK] Direct Forensic Engine Pipeline Passed (Score: {score}/100 - {severity.upper()})")

    res = client.post("/api/v1/emails/analyze", json={"raw_content": raw_eml})
    assert res.status_code == 200
    eml_data = res.json()
    assert eml_data["threat_score"] >= 85
    print(f"  [OK] Email Ingestion & Analysis API Endpoint Passed (ID: {eml_data['email_id']})")

def test_threat_statistics():
    res = client.get("/api/v1/threats/statistics")
    assert res.status_code == 200
    assert res.json()["total_emails"] > 0
    print("  [OK] Threat Statistics Endpoint Passed")

def test_intelligence():
    res = client.get("/api/v1/intelligence/ip/185.220.101.4")
    assert res.status_code == 200
    assert res.json()["country"] == "Germany"
    print("  [OK] IP Intelligence Lookup Passed")

    res = client.get("/api/v1/intelligence/domain/paypa1-security.com")
    assert res.status_code == 200
    assert res.json()["is_typosquat"] is True
    print("  [OK] Domain Typosquatting Analysis Passed")

def test_cases_and_evidence():
    res = client.get("/api/v1/cases/case-1024/graph")
    assert res.status_code == 200
    assert len(res.json()["nodes"]) > 0
    print("  [OK] Case Attack Graph Payload Passed")

    res = client.get("/api/v1/evidence/")
    assert res.status_code == 200
    print(f"  [OK] Evidence Chain of Custody Registry Passed ({len(res.json())} items)")

if __name__ == "__main__":
    print("\n--- Running ThreatTrace Backend Verification Suite ---")
    test_root()
    test_auth()
    test_forensic_pipeline()
    test_threat_statistics()
    test_intelligence()
    test_cases_and_evidence()
    print("\n[SUCCESS] ALL 6 BACKEND MODULES VERIFIED & OPERATIONAL!\n")
