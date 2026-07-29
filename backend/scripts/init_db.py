"""
Create all tables directly from the SQLAlchemy models -- no migration
framework. Simple and fine for a single-developer/early-stage build;
swap to Alembic later if you need versioned migrations / production
rollback support.

Usage:
    python -m scripts.init_db
"""
from app.core.database import Base, engine
import app.models  # populates Base.metadata


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)
    print(f"Created tables: {sorted(Base.metadata.tables.keys())}")

def drop_tables() -> None:
    Base.metadata.drop_all(bind=engine)
    print(f"Dropped tables: {sorted(Base.metadata.tables.keys())}")


if __name__ == "__main__":
    create_tables()

   #-------------------CAUTION-------------------
    # drop_tables()  # uncomment to drop all tables (use with caution!)
