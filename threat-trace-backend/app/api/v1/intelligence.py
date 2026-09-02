from fastapi import APIRouter
from app.services.ip_intelligence import IPIntelligence
from app.services.domain_intelligence import DomainIntelligence
from app.services.threat_intel import ThreatIntelService

router = APIRouter(prefix="/intelligence", tags=["Threat Intelligence"])

@router.get("/ip/{ip}")
async def get_ip_intelligence(ip: str):
    return await IPIntelligence.get_ip_intel(ip)

@router.get("/domain/{domain}")
def get_domain_intelligence(domain: str):
    return DomainIntelligence.analyze_domain(domain)

@router.get("/query")
def query_threat_intel(type: str = "ip", query: str = ""):
    return ThreatIntelService.query_intel(type, query)
