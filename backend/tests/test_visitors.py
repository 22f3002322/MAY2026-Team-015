from __future__ import annotations

import pytest
from fastapi import status
from httpx import AsyncClient
from datetime import date, time
from sqlalchemy import select

from app.models.visitor import Visitor, VisitorRequest, VisitorLog
from app.models.staff import SecurityGuard
from app.models.role import RoleEnum
from tests.conftest import create_test_user, create_test_resident


class TestVisitors:
    @pytest.mark.asyncio
    async def test_otp_rejected_after_arrival(self, client: AsyncClient, seeded_db: AsyncSession):
        _, profile, _ = await create_test_resident(seeded_db, flat_number="V-101")
        _, guard_token = await create_test_user(seeded_db, RoleEnum.SECURITY.value, email="guard1@test.com")
        
        visitor = Visitor(visitor_name="Guest", phone="9999999999", visitor_type="guest")
        seeded_db.add(visitor)
        await seeded_db.commit()
        await seeded_db.refresh(visitor)
        
        request = VisitorRequest(
            resident_id=profile.resident_id,
            visitor_id=visitor.visitor_id,
            expected_date=date(2025, 8, 1),
            expected_time=time(14, 0),
            status="expected",
            otp="hashed_otp_1234"
        )
        seeded_db.add(request)
        await seeded_db.commit()
        await seeded_db.refresh(request)
        
        request.status = "arrived"
        await seeded_db.commit()
        
        response = await client.post(f"/api/v1/visitors/{request.request_id}/verify-otp", headers={"Authorization": f"Bearer {guard_token}"}, json={"otp": "1234"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_wrong_otp_is_rejected(self, client: AsyncClient, seeded_db: AsyncSession):
        _, profile, _ = await create_test_resident(seeded_db, flat_number="V-102")
        _, guard_token = await create_test_user(seeded_db, RoleEnum.SECURITY.value, email="guard2@test.com")
        
        visitor = Visitor(visitor_name="Guest2", phone="8888888888", visitor_type="guest")
        seeded_db.add(visitor)
        await seeded_db.commit()
        await seeded_db.refresh(visitor)
        
        request = VisitorRequest(
            resident_id=profile.resident_id,
            visitor_id=visitor.visitor_id,
            expected_date=date(2025, 8, 1),
            expected_time=time(15, 0),
            status="expected",
            otp="hashed_otp_5678"
        )
        seeded_db.add(request)
        await seeded_db.commit()
        await seeded_db.refresh(request)
        
        response = await client.post(f"/api/v1/visitors/{request.request_id}/verify-otp", headers={"Authorization": f"Bearer {guard_token}"}, json={"otp": "9999"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
