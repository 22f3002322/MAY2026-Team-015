from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Column
from sqlalchemy import DateTime

def ist_now():
    return datetime.now(ZoneInfo("Asia/Kolkata"))

def ist_format(dt):
    if dt is not None:
        return dt.strftime("%Y-%m-%d %H:%M:%S") 
    else: 
        return None


class TimestampMixin:

    created_at = Column(
        DateTime,
        default= ist_now,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=None,
        onupdate=ist_now,
        nullable=True
    )
