from sqlalchemy import Column, Date, String, Text

from app.database import Base


class AdjudicationValueCode(Base):
    __tablename__ = "adjudication_value_codes"
    code = Column(String, primary_key=True)
    display = Column(String)
    definition = Column(Text)


class CarcCode(Base):
    __tablename__ = "carc_codes"
    code = Column(String, primary_key=True)
    description = Column(Text)
    action_hint = Column(Text)
    start_date = Column(Date, nullable=True)


class RarcCode(Base):
    __tablename__ = "rarc_codes"
    code = Column(String, primary_key=True)
    description = Column(Text)
    start_date = Column(Date, nullable=True)


class ClaimAdjustmentGroupCode(Base):
    __tablename__ = "claim_adjustment_group_codes"
    code = Column(String, primary_key=True)
    description = Column(String)
    responsibility = Column(Text)  # "Patient" or "Provider"
    start_date = Column(Date, nullable=True)
