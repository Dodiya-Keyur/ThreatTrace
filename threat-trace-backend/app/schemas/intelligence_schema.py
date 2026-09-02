from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class IpIntelligenceResponse(BaseModel):
    ip: str
    country: str
    countryCode: str
    city: str
    lat: float
    lng: float
    isp: str
    asn: str
    networkType: str
    isBlacklisted: bool
    indicators: Dict[str, str]

class DomainIntelligenceResponse(BaseModel):
    query: str
    domain: str
    createdDate: str
    registrar: str
    nameservers: List[str]
    mxRecords: List[str]
    hosting: str
    dnsRecords: Dict[str, List[str]]
    reputation: str
    knownCampaigns: int
    relatedIps: List[str]
    relatedDomains: List[str]
