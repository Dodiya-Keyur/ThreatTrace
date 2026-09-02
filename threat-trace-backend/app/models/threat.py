import datetime
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Threat(Base):
    __tablename__ = "threats"

    id = Column(String, primary_key=True, index=True)
    email_id = Column(String, ForeignKey("email_records.id"), unique=True)
    threat_score = Column(Integer, default=0)
    classification = Column(String, default="LEGITIMATE")
    severity = Column(String, default="low")
    status = Column(String, default="detected")
    
    indicators = Column(JSON, default=list)
    nlp_analysis = Column(JSON, default=dict)
    authentication = Column(JSON, default=dict)
    received_chain = Column(JSON, default=list)
    origin_ip = Column(String, default="")
    origin_country = Column(String, default="")
    extracted_urls = Column(JSON, default=list)
    extracted_attachments = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    email = relationship("EmailRecord", back_populates="threat")

ThreatResult = Threat
