from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ThreatStatsResponse(BaseModel):
    totalEmailsAnalyzed: int
    threatsDetected: int
    highRiskAlerts: int
    activeCases: int
    distribution: Dict[str, int]
    geoDistribution: List[Dict[str, Any]]
