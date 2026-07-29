from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


# SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    echo = True,           # Logs all executed SQL queries to standard output (great for debugging)
    pool_size = 10,        # Number of connections to keep open in the pool
    max_overflow = 20,     # Extra connections allowed beyond pool_size under heavy load
    pool_recycle = 3600,   # Recycles connections after 1 hour (prevents stale connections)
    pool_pre_ping = True   # Checks if connections are alive before using them, preventing errors from stale connections
)


# Session Factory
SessionLocal = sessionmaker(
    bind=engine, # Binds the session to the engine, so all sessions created will use this engine for database operations
    autoflush=False, # Disables automatic flushing of changes to the database before queries, giving you more control over when changes are persisted
    autocommit=False # Disables automatic committing of transactions, allowing you to manage transactions manually for better control over database operations
)


# Base class for all ORM models
Base = declarative_base()

# Yields a database session to the caller, 
# allowing them to perform database operations within a managed context. 
# The session will be automatically closed after the caller is done using it, 
# ensuring proper resource management and preventing connection leaks.
def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()
