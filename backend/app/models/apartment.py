from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint, Date, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin

class Block(Base):
    """
    Matches er-dbml.txt `blocks` table exactly -- no timestamps on it in
    the diagram, so none added here either (schema source of truth is
    followed literally, per README).
    """

    __tablename__ = "blocks"

    block_id = Column(Integer, primary_key=True)
    block_name = Column(String(50), unique=True, nullable=False)
    total_flats = Column(Integer, nullable=False)

    flats = relationship("Flat", back_populates="block")




class Flat(Base):

    """
    Matches er-dbml.txt `flats` table.

    occupancy_status is a DERIVED field kept in sync by
    app/services/apartment_service.py (occupied iff at least one
    OccupancyHistory row for this flat currently has is_current=True) --
    it should never be set directly from a router/request payload.

    block_id/flat_number aren't marked not-null in the diagram, but a
    flat with no block or number isn't meaningful, so
    app/schemas/apartment.py's FlatCreate requires both at the API layer
    (same pattern already used elsewhere in this project, e.g.
    users.full_name is nullable in the DB but required by SignupRequest).
    """
    __tablename__ = "flats"
    __table_args__ = (UniqueConstraint("block_id", "flat_number", name="uq_flats_block_id_flat_number"),)

    flat_id = Column(Integer, primary_key=True)
    block_id = Column(Integer, ForeignKey("blocks.block_id"), nullable=True)
    flat_number = Column(String(20), nullable=True)
    floor_number = Column(Integer, nullable=True)
    flat_type = Column(String(20), nullable=True)  # 1BHK, 2BHK
    occupancy_status = Column(String(20), nullable=False, default="vacant")  # occupied, vacant


    block = relationship("Block", back_populates="flats")
    resident_profiles = relationship("ResidentProfile", back_populates="flat")
    # bills = relationship("MaintenanceBill", back_populates="flat")
    occupancy_history = relationship("OccupancyHistory", back_populates="flat")




class ResidentProfile(Base, TimestampMixin):
    """
    flat_id has a real FK to `flats` (Module 2).

    Unlike most other fields here, flat_id can be set two ways:
      1. At signup, a resident picks an existing flat (validated to
         exist -- see auth_service.signup_user) -- this is a *request*,
         not yet backed by an occupancy_history row.
      2. At verification, auth_service.verify_user() calls
         apartment_service.move_in() for them, which is what actually
         creates the occupancy_history row and flips the flat to
         occupied, dated to the moment of verification.
      3. Afterwards, only apartment_service.move_in()/move_out() (via
         the Admin/Committee-only /api/v1/residents/{id}/move-in|out
         endpoints) ever change it, keeping it in sync with
         occupancy_history.
    So: flat_id may briefly be set with no *current* occupancy_history
    row backing it (signed up, not yet verified) -- routers/services
    other than the two above should treat it as read-only.

    profile_image stores the public URL path returned by the profile
    picture upload endpoint (e.g. "/media/profile_pictures/xxx.jpg"), not
    a raw filesystem path -- see app/services/profile_service.py.
    """

    __tablename__ = "resident_profiles"

    resident_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), unique=True, nullable=False)
    flat_id = Column(Integer, ForeignKey("flats.flat_id"), nullable=True)

    emergency_contact = Column(String(20), nullable=True)
    alternate_phone = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    profile_image = Column(String(255), nullable=True)

    user = relationship("User", back_populates="resident_profile")
    flat = relationship("Flat", back_populates="residents")
    occupancy_history = relationship("OccupancyHistory", back_populates="resident")



class OccupancyHistory(Base, TimestampMixin):
    """
    Matches er-dbml.txt `occupancy_history` table. One row per
    move-in/move-out cycle for a resident<->flat pairing. Only
    app.services.apartment_service.move_in()/move_out() ever write to
    this table (and to the flat_id/occupancy_status fields it keeps in
    sync on ResidentProfile/Flat) -- see that module for the invariants
    (at most one is_current=True row per resident at any time).
    """

    __tablename__ = "occupancy_history"

    occupancy_id = Column(Integer, primary_key=True)
    resident_id = Column(Integer, ForeignKey("resident_profiles.resident_id"), nullable=False, index=True)
    flat_id = Column(Integer, ForeignKey("flats.flat_id"), nullable=False, index=True)

    occupancy_type = Column(String(20), nullable=True)  # Owner, Rental
    move_in_date = Column(Date, nullable=True)
    move_out_date = Column(Date, nullable=True)
    is_current = Column(Boolean, nullable=False, default=True)

    resident = relationship("ResidentProfile", back_populates="occupancy_history")
    flat = relationship("Flat", back_populates="occupancy_records")