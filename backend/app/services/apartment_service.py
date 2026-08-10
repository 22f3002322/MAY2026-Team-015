"""
User & Apartment Management service layer (Module 2).

Schema: er-dbml.txt (blocks, flats, resident_profiles.flat_id,
occupancy_history) -- all four were already anticipated in the diagram;
this module is what actually populates/maintains them.

Core invariant this module is responsible for keeping true:
    A resident has AT MOST ONE occupancy_history row with is_current=True
    at any given time, and whenever such a row exists,
    resident_profiles.flat_id matches its flat_id.
    A flat's occupancy_status is "occupied" iff at least one
    occupancy_history row referencing it has is_current=True, else
    "vacant" -- it is never set directly by a router.

Only move_in()/move_out() below (and, transitively,
auth_service.verify_user(), which calls move_in() the moment a Resident
who picked a flat at signup gets verified) ever touch flat_id/
occupancy_status/occupancy_history. One wrinkle worth knowing: a resident
can have flat_id set (their signup choice) with NO current
occupancy_history row yet, in the window between signing up and being
verified -- that's expected, not a bug (see ResidentProfile's docstring).
auth_service.signup_user additionally guards against two residents
claiming the same still-vacant flat in that window -- see the
already_claimed check there.
Everything else (signup's initial flat_id write, profile edits) treats
flat_id as otherwise read-only, which is why ResidentProfileUpdate
(admin edit) excludes it.
"""
from datetime import date as date_type

from sqlalchemy.orm import Session

from app.models.apartment import Block, Flat, ResidentProfile, OccupancyHistory
from app.models.mixins import ist_now
from app.schemas.apartment_schema import BlockCreate, BlockUpdate, FlatCreate, FlatUpdate, ResidentProfileUpdate
from app.utils.api_error import BadRequest, Conflict, NotFound


# --------------------------------------------------------------------------
# Blocks
# --------------------------------------------------------------------------
def create_block(db: Session, payload: BlockCreate) -> Block:
    if db.query(Block).filter(Block.block_name == payload.block_name).first():
        raise Conflict(f"A block named '{payload.block_name}' already exists.")

    block = Block(block_name=payload.block_name, total_flats=payload.total_flats)
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


def get_block(db: Session, block_id: int) -> Block:
    block = db.query(Block).filter(Block.block_id == block_id).first()
    if block is None:
        raise NotFound("Block not found.")
    return block


def list_blocks(db: Session) -> list[Block]:
    return db.query(Block).order_by(Block.block_name.asc()).all()


def update_block(db: Session, block_id: int, payload: BlockUpdate) -> Block:
    block = get_block(db, block_id)

    if payload.block_name is not None and payload.block_name != block.block_name:
        if db.query(Block).filter(Block.block_name == payload.block_name).first():
            raise Conflict(f"A block named '{payload.block_name}' already exists.")
        block.block_name = payload.block_name

    if payload.total_flats is not None:
        registered = db.query(Flat).filter(Flat.block_id == block_id).count()
        if payload.total_flats < registered:
            raise BadRequest(
                f"Block '{block.block_name}' already has {registered} flats registered -- "
                f"total_flats can't be set lower than that."
            )
        block.total_flats = payload.total_flats

    db.commit()
    db.refresh(block)
    return block


def delete_block(db: Session, block_id: int) -> None:
    block = get_block(db, block_id)
    if db.query(Flat).filter(Flat.block_id == block_id).count() > 0:
        raise BadRequest("Cannot delete a block that still has flats registered under it.")
    db.delete(block)
    db.commit()


# --------------------------------------------------------------------------
# Flats
# --------------------------------------------------------------------------
def create_flat(db: Session, payload: FlatCreate) -> Flat:
    block = get_block(db, payload.block_id)  # 404 if the block doesn't exist

    existing = (
        db.query(Flat)
        .filter(Flat.block_id == payload.block_id, Flat.flat_number == payload.flat_number)
        .first()
    )
    if existing:
        raise Conflict(f"Flat '{payload.flat_number}' already exists in block '{block.block_name}'.")

    registered = db.query(Flat).filter(Flat.block_id == payload.block_id).count()
    if registered >= block.total_flats:
        raise BadRequest(
            f"Block '{block.block_name}' already has its full allotment of {block.total_flats} flats."
        )

    flat = Flat(
        block_id=payload.block_id,
        flat_number=payload.flat_number,
        floor_number=payload.floor_number,
        flat_type=payload.flat_type,
        occupancy_status="vacant",
    )
    db.add(flat)
    db.commit()
    db.refresh(flat)
    return flat


def get_flat(db: Session, flat_id: int, for_update: bool = False) -> Flat:
    query = db.query(Flat).filter(Flat.flat_id == flat_id)
    if for_update:
        # BUGFIX (CODE_REVIEW.md 2): used by auth_service.signup_user to
        # close the double-flat-claim race -- see that call site for
        # details. Default stays False so every other caller (the
        # flats router's plain GET, move_in/move_out, etc.) is unaffected
        # and doesn't pay for a lock it doesn't need.
        query = query.with_for_update()
    flat = query.first()
    if flat is None:
        raise NotFound("Flat not found.")
    return flat


def list_flats(
    db: Session,
    block_id: int | None = None,
    occupancy_status: str | None = None,
    flat_number: str | None = None,
) -> list[Flat]:
    query = db.query(Flat)
    if block_id is not None:
        query = query.filter(Flat.block_id == block_id)
    if occupancy_status is not None:
        query = query.filter(Flat.occupancy_status == occupancy_status)
    if flat_number is not None:
        query = query.filter(Flat.flat_number == flat_number)
    return query.order_by(Flat.block_id.asc(), Flat.flat_number.asc()).all()


def update_flat(db: Session, flat_id: int, payload: FlatUpdate) -> Flat:
    flat = get_flat(db, flat_id)

    if payload.flat_number is not None:
        clash = (
            db.query(Flat)
            .filter(
                Flat.block_id == flat.block_id,
                Flat.flat_number == payload.flat_number,
                Flat.flat_id != flat_id,
            )
            .first()
        )
        if clash:
            raise Conflict(f"Flat '{payload.flat_number}' already exists in this block.")
        flat.flat_number = payload.flat_number

    if payload.floor_number is not None:
        flat.floor_number = payload.floor_number
    if payload.flat_type is not None:
        flat.flat_type = payload.flat_type

    db.commit()
    db.refresh(flat)
    return flat


def current_residents_of_flat(db: Session, flat_id: int) -> list[ResidentProfile]:
    return db.query(ResidentProfile).filter(ResidentProfile.flat_id == flat_id).all()


def _sync_flat_occupancy_status(db: Session, flat: Flat) -> None:
    has_current_occupant = (
        db.query(OccupancyHistory)
        .filter(OccupancyHistory.flat_id == flat.flat_id, OccupancyHistory.is_current.is_(True))
        .first()
        is not None
    )
    flat.occupancy_status = "occupied" if has_current_occupant else "vacant"


# --------------------------------------------------------------------------
# Residents: directory, profile edits
# --------------------------------------------------------------------------
def get_resident_profile(db: Session, resident_id: int) -> ResidentProfile:
    profile = db.query(ResidentProfile).filter(ResidentProfile.resident_id == resident_id).first()
    if profile is None:
        raise NotFound("Resident not found.")
    return profile


def list_residents(db: Session, block_id: int | None = None, flat_id: int | None = None) -> list[ResidentProfile]:
    query = db.query(ResidentProfile)
    if flat_id is not None:
        query = query.filter(ResidentProfile.flat_id == flat_id)
    elif block_id is not None:
        query = query.join(Flat, ResidentProfile.flat_id == Flat.flat_id).filter(Flat.block_id == block_id)
    return query.order_by(ResidentProfile.resident_id.asc()).all()


def update_resident_profile(db: Session, resident_id: int, payload: ResidentProfileUpdate) -> ResidentProfile:
    profile = get_resident_profile(db, resident_id)

    if payload.emergency_contact is not None:
        profile.emergency_contact = payload.emergency_contact
    if payload.alternate_phone is not None:
        profile.alternate_phone = payload.alternate_phone
    if payload.occupation is not None:
        profile.occupation = payload.occupation

    db.commit()
    db.refresh(profile)
    return profile


# --------------------------------------------------------------------------
# Occupancy: move-in / move-out
# --------------------------------------------------------------------------
def move_in(
    db: Session,
    resident_id: int,
    flat_id: int,
    occupancy_type: str,
    move_in_date: date_type | None,
) -> OccupancyHistory:
   
    profile = get_resident_profile(db, resident_id)
    flat = get_flat(db, flat_id)

    existing_current = (
        db.query(OccupancyHistory)
        .filter(OccupancyHistory.resident_id == resident_id, OccupancyHistory.is_current.is_(True))
        .first()
    )
    if existing_current is not None:
        raise BadRequest("This resident already has a current flat assignment. Move them out first.")

    if flat.occupancy_status != "vacant":
        raise Conflict(f"Flat '{flat.flat_number}' is not vacant.")

    effective_date = move_in_date or ist_now().date()

    occupancy = OccupancyHistory(
        resident_id=resident_id,
        flat_id=flat_id,
        occupancy_type=occupancy_type,
        move_in_date=effective_date,
        is_current=True,
    )
    db.add(occupancy)

    profile.flat_id = flat_id
    db.flush()  # occupancy needs its PK before the status-sync query below

    _sync_flat_occupancy_status(db, flat)

    db.commit()
    db.refresh(occupancy)
    return occupancy


def move_out(db: Session, resident_id: int, move_out_date: date_type | None) -> OccupancyHistory:
    profile = get_resident_profile(db, resident_id)

    current = (
        db.query(OccupancyHistory)
        .filter(OccupancyHistory.resident_id == resident_id, OccupancyHistory.is_current.is_(True))
        .first()
    )
    if current is None:
        raise BadRequest("This resident has no current flat assignment to move out of.")

    flat = get_flat(db, current.flat_id)

    current.is_current = False
    current.move_out_date = move_out_date or ist_now().date()
    profile.flat_id = None
    db.flush()

    _sync_flat_occupancy_status(db, flat)

    db.commit()
    db.refresh(current)
    return current


def occupancy_history_for_resident(db: Session, resident_id: int) -> list[OccupancyHistory]:
    get_resident_profile(db, resident_id)  # 404 if the resident doesn't exist
    return (
        db.query(OccupancyHistory)
        .filter(OccupancyHistory.resident_id == resident_id)
        .order_by(OccupancyHistory.move_in_date.desc())
        .all()
    )