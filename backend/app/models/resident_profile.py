from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


class ResidentProfile(Base, TimestampMixin):
    """
    flat_id has no FK constraint yet -- `flats` is a Module 2 table that
    doesn't exist in this build. Add
    `ForeignKey("flats.flat_id")` once Module 2 lands.

    profile_image stores the public URL path returned by the profile
    picture upload endpoint (e.g. "/media/profile_pictures/xxx.jpg"), not
    a raw filesystem path -- see app/services/profile_service.py.
    """

    __tablename__ = "resident_profiles"

    resident_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    flat_id = Column(Integer, nullable=True)  # FK -> flats.flat_id, added in Module 2

    emergency_contact = Column(String(20), nullable=True)
    alternate_phone = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    profile_image = Column(String(255), nullable=True)

    user = relationship("User", back_populates="resident_profile")
