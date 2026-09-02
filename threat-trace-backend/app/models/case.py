import datetime
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(String, default="investigating")
    severity = Column(String, default="critical")
    assignee = Column(String, default="Dr. Anika Sharma")
    
    tags = Column(JSON, default=list)
    related_ips = Column(JSON, default=list)
    related_domains = Column(JSON, default=list)
    timeline = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    emails = relationship("EmailRecord", back_populates="case")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
