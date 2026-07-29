from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin_or_committee
from app.models.apartment import Block
from app.schemas.apartment_schema import BlockCreate, BlockOut, BlockUpdate
from app.services import apartment_service
from app.utils.api_response import success_response

router = APIRouter(prefix="/api/v1/blocks", tags=["apartments"])


def _to_block_out(block: Block) -> BlockOut:
    return BlockOut(
        block_id=block.block_id,
        block_name=block.block_name,
        total_flats=block.total_flats,
        flat_count=len(block.flats),
    )


@router.post("")
def create_block(
    payload: BlockCreate,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only."""
    block = apartment_service.create_block(db, payload)
    return success_response(data=_to_block_out(block), message="Block created successfully.")


@router.get("")
def list_blocks(db: Session = Depends(get_db)):
    """Deliberately PUBLIC (no auth) -- lets the signup form show a block
    picker before the resident has an account. Only structural info
    (name/total_flats/flat_count), no resident data."""
    blocks = apartment_service.list_blocks(db)
    return success_response(data=[_to_block_out(b) for b in blocks])


@router.get("/{block_id}")
def get_block(block_id: int, db: Session = Depends(get_db)):
    """Public, same reasoning as the list endpoint above."""
    block = apartment_service.get_block(db, block_id)
    return success_response(data=_to_block_out(block))


@router.patch("/{block_id}")
def update_block(
    block_id: int,
    payload: BlockUpdate,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only."""
    block = apartment_service.update_block(db, block_id, payload)
    return success_response(data=_to_block_out(block), message="Block updated successfully.")


@router.delete("/{block_id}")
def delete_block(
    block_id: int,
    _staff=Depends(require_admin_or_committee),
    db: Session = Depends(get_db),
):
    """Admin/Committee only. Refuses to delete a block that still has flats."""
    apartment_service.delete_block(db, block_id)
    return success_response(message="Block deleted successfully.")