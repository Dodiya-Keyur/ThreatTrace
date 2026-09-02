import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"), nullable=True)
    filename = Column(String, nullable=False)
    evidence_type = Column(String, default="email_source")
    sha256 = Column(String, nullable=False)
    collected_by = Column(String, default="Dr. Anika Sharma")
    collected_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="preserved")
    audit_trail = Column(JSON, default=list)
    
    case = relationship("Case", back_populates="evidence_items")
