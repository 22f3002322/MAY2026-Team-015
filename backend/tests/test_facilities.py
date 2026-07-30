from __future__ import annotations

import pytest
from fastapi import status
from httpx import AsyncClient
from datetime import date, time
from sqlalchemy import select

from app.models.facility import Facility, FacilityBooking
from app.models.apartment import Flat, ResidentProfile, Block
from app.models.role import RoleEnum
from app.models.auth import User, Role
from app.models.staff import MaintenanceStaff
from tests.conftest import create_test_resident, create_test_user


class TestFacilityCRUD:
    @pytest.mark.asyncio
    async def test_committee_can_create_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_fac@test.com")
        response = await client.post("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "facility_name": "Pool",
            "description": "Outdoor swimming pool",
            "capacity": 10,
            "opening_time": "08:00:00",
            "closing_time": "20:00:00",
            "slot_duration": 30,
            "maximum_duration": 120,
            "is_active": True,
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["facility_name"] == "Pool"
        assert "facility_id" in data

    @pytest.mark.asyncio
    async def test_committee_can_list_facilities(self, client: AsyncClient, seeded_db: AsyncSession):
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_listfac@test.com")
        facility = Facility(
            facility_name="Gym",
            description="",
            capacity=5,
            opening_time=time(6, 0),
            closing_time=time(22, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        response = await client.get("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {committee_token}"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert any(f["facility_name"] == "Gym" for f in data)

    @pytest.mark.asyncio
    async def test_committee_can_get_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Tennis Court",
            description="Outdoor court",
            capacity=2,
            opening_time=time(7, 0),
            closing_time=time(21, 0),
            slot_duration=60,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_getfac@test.com")
        response = await client.get(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {committee_token}"})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["facility_name"] == "Tennis Court"

    @pytest.mark.asyncio
    async def test_committee_can_update_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Old Name",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_updfac@test.com")
        response = await client.patch(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "facility_name": "New Name"
        })
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["facility_name"] == "New Name"

    @pytest.mark.asyncio
    async def test_committee_get_facility_404(self, client: AsyncClient, seeded_db: AsyncSession):
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_no_fac@test.com")
        response = await client.get("/api/v1/admin/facilities/99999", headers={"Authorization": f"Bearer {committee_token}"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_committee_update_facility_404(self, client: AsyncClient, seeded_db: AsyncSession):
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_upd_404@test.com")
        response = await client.patch("/api/v1/admin/facilities/99999", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "facility_name": "Won't exist"
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_admin_cannot_create_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_fac@test.com")
        response = await client.post("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "facility_name": "Pool",
            "description": "",
            "capacity": 10,
            "opening_time": "08:00:00",
            "closing_time": "20:00:00",
            "slot_duration": 30,
            "maximum_duration": 120,
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_admin_cannot_list_facilities(self, client: AsyncClient, seeded_db: AsyncSession):
        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_listfac@test.com")
        response = await client.get("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_admin_cannot_get_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Tennis Court",
            description="Outdoor court",
            capacity=2,
            opening_time=time(7, 0),
            closing_time=time(21, 0),
            slot_duration=60,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_getfac2@test.com")
        response = await client.get(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_admin_cannot_update_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Old Name",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_updfac2@test.com")
        response = await client.patch(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "facility_name": "New Name"
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_resident_cannot_create_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        _, _, resident_token = await create_test_resident(seeded_db, flat_number="ResFac-101", email="resident_fac@test.com")
        response = await client.post("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {resident_token}"}, json={
            "facility_name": "Pool",
            "description": "",
            "capacity": 10,
            "opening_time": "08:00:00",
            "closing_time": "20:00:00",
            "slot_duration": 30,
            "maximum_duration": 120,
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_resident_cannot_list_facilities(self, client: AsyncClient, seeded_db: AsyncSession):
        _, _, resident_token = await create_test_resident(seeded_db, flat_number="ResFac-102", email="resident_fac2@test.com")
        response = await client.get("/api/v1/admin/facilities", headers={"Authorization": f"Bearer {resident_token}"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_resident_cannot_get_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Tennis Court",
            description="Outdoor court",
            capacity=2,
            opening_time=time(7, 0),
            closing_time=time(21, 0),
            slot_duration=60,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, _, resident_token = await create_test_resident(seeded_db, flat_number="ResFac-103", email="resident_fac3@test.com")
        response = await client.get(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {resident_token}"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_resident_cannot_update_facility(self, client: AsyncClient, seeded_db: AsyncSession):
        facility = Facility(
            facility_name="Old Name",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)
        _, _, resident_token = await create_test_resident(seeded_db, flat_number="ResFac-104", email="resident_fac4@test.com")
        response = await client.patch(f"/api/v1/admin/facilities/{facility.facility_id}", headers={"Authorization": f"Bearer {resident_token}"}, json={
            "facility_name": "New Name"
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestFacilityBookings:
    @pytest.mark.asyncio
    async def test_resident_can_create_booking(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block BK", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="BK-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Pool",
            description="",
            capacity=10,
            opening_time=time(8, 0),
            closing_time=time(20, 0),
            slot_duration=30,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="BK-101")

        response = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["facility_id"] == facility.facility_id
        assert data["resident_id"] == profile.resident_id
        assert data["status"] == "booked"

    @pytest.mark.asyncio
    async def test_booking_rejects_overlapping_slots(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block OLAP", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="OLAP-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Gym",
            description="",
            capacity=5,
            opening_time=time(6, 0),
            closing_time=time(22, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="OLAP-101")

        resp1 = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        })
        assert resp1.status_code == status.HTTP_200_OK

        resp2 = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "09:30:00",
            "end_time": "10:30:00",
        })
        assert resp2.status_code == status.HTTP_409_CONFLICT

    @pytest.mark.asyncio
    async def test_booking_rejects_end_before_start(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block EST", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="EST-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Library",
            description="",
            capacity=3,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="EST-101")

        response = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "09:00:00",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_booking_rejects_exceeding_max_duration(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block MAXDUR", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="MAXDUR-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Meeting Room",
            description="",
            capacity=8,
            opening_time=time(8, 0),
            closing_time=time(20, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="MAXDUR-101")

        response = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "09:00:00",
            "end_time": "11:00:00",
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @pytest.mark.asyncio
    async def test_resident_sees_only_own_bookings(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block OwnBook", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat1 = Flat(flat_number="OwnBook-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        flat2 = Flat(flat_number="OwnBook-102", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add_all([flat1, flat2])
        await seeded_db.commit()

        for f in [flat1, flat2]:
            await seeded_db.refresh(f)

        facility = Facility(
            facility_name="Basketball Court",
            description="",
            capacity=2,
            opening_time=time(6, 0),
            closing_time=time(22, 0),
            slot_duration=30,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile1, token1 = await create_test_resident(seeded_db, flat_number="OwnBook-101", email="ob1@test.com")
        await create_test_resident(seeded_db, flat_number="OwnBook-102", email="ob2@test.com")

        booking1 = FacilityBooking(
            facility_id=facility.facility_id,
            resident_id=profile1.resident_id,
            booking_date=date(2025, 8, 1),
            start_time=time(9, 0),
            end_time=time(10, 0),
            status="booked",
        )
        seeded_db.add(booking1)
        await seeded_db.commit()
        await seeded_db.refresh(booking1)

        response = await client.get("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token1}"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        for b in data:
            assert b["resident_id"] == profile1.resident_id

    @pytest.mark.asyncio
    async def test_resident_sees_empty_bookings(self, client: AsyncClient, seeded_db: AsyncSession):
        _, _, token = await create_test_resident(seeded_db, flat_number="EmptyBK-101", email="emptybk@test.com")
        response = await client.get("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    @pytest.mark.asyncio
    async def test_committee_sees_all_bookings(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block ComBK", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="ComBK-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Committee Facility",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="ComBK-101")

        create_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        })
        assert create_resp.status_code == status.HTTP_200_OK
        booking_id = create_resp.json()["booking_id"]

        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_bk@test.com")
        response = await client.get("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {committee_token}"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert any(b["booking_id"] == booking_id for b in data)

    @pytest.mark.asyncio
    async def test_admin_sees_all_bookings(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block AdminBK", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="AdminBK-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Admin Facility",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="AdminBK-101")

        create_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        })
        assert create_resp.status_code == status.HTTP_200_OK
        booking_id = create_resp.json()["booking_id"]

        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_bk@test.com")
        response = await client.get("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert any(b["booking_id"] == booking_id for b in data)

    @pytest.mark.asyncio
    async def test_get_booking_returns_404(self, client: AsyncClient, seeded_db: AsyncSession):
        _, token = await create_test_user(seeded_db, RoleEnum.RESIDENT.value, email="nobk404@test.com")
        response = await client.get("/api/v1/facility-bookings/99999", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @pytest.mark.asyncio
    async def test_resident_can_get_own_booking(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block GetBK", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="GetBK-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Get Facility",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="GetBK-101")

        create_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        })
        assert create_resp.status_code == status.HTTP_200_OK
        booking_id = create_resp.json()["booking_id"]

        response = await client.get(f"/api/v1/facility-bookings/{booking_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["booking_id"] == booking_id

    @pytest.mark.asyncio
    async def test_committee_can_update_booking(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block UpdBK", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="UpdBK-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Upd Facility",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="UpdBK-101")

        create_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        })
        assert create_resp.status_code == status.HTTP_200_OK
        booking_id = create_resp.json()["booking_id"]

        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_updbk@test.com")
        response = await client.patch(f"/api/v1/facility-bookings/{booking_id}", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "status": "cancelled"
        })
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "cancelled"

    @pytest.mark.asyncio
    async def test_admin_cannot_update_booking(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block AdminUpd", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="AdminUpd-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Admin Facility",
            description="",
            capacity=5,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=60,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="AdminUpd-101")

        create_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "10:00:00",
            "end_time": "11:00:00",
        })
        assert create_resp.status_code == status.HTTP_200_OK
        booking_id = create_resp.json()["booking_id"]

        _, admin_token = await create_test_user(seeded_db, RoleEnum.ADMIN.value, email="admin_cannot_upd@test.com")
        response = await client.patch(f"/api/v1/facility-bookings/{booking_id}", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "status": "cancelled"
        })
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.asyncio
    async def test_booking_update_rejects_overlapping(self, client: AsyncClient, seeded_db: AsyncSession):
        block = Block(block_name="Block UpdOLAP", total_flats=100)
        seeded_db.add(block)
        await seeded_db.commit()
        await seeded_db.refresh(block)

        flat = Flat(flat_number="UpdOLAP-101", floor_number=1, occupancy_status="occupied", block_id=block.block_id)
        seeded_db.add(flat)
        await seeded_db.commit()
        await seeded_db.refresh(flat)

        facility = Facility(
            facility_name="Conf Room",
            description="",
            capacity=10,
            opening_time=time(8, 0),
            closing_time=time(18, 0),
            slot_duration=30,
            maximum_duration=120,
            is_active=True,
        )
        seeded_db.add(facility)
        await seeded_db.commit()
        await seeded_db.refresh(facility)

        _, profile, token = await create_test_resident(seeded_db, flat_number="UpdOLAP-101")

        b1 = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "09:00:00",
            "end_time": "10:00:00",
        })
        assert b1.status_code == status.HTTP_200_OK
        booking1_id = b1.json()["booking_id"]

        b2_resp = await client.post("/api/v1/facility-bookings", headers={"Authorization": f"Bearer {token}"}, json={
            "facility_id": facility.facility_id,
            "resident_id": profile.resident_id,
            "booking_date": "2025-08-01",
            "start_time": "11:00:00",
            "end_time": "12:00:00",
        })
        assert b2_resp.status_code == status.HTTP_200_OK
        booking2_id = b2_resp.json()["booking_id"]

        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_olap@test.com")
        response = await client.patch(f"/api/v1/facility-bookings/{booking2_id}", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "start_time": "09:30:00",
            "end_time": "10:30:00",
        })
        assert response.status_code == status.HTTP_409_CONFLICT

    @pytest.mark.asyncio
    async def test_committee_update_booking_404(self, client: AsyncClient, seeded_db: AsyncSession):
        _, committee_token = await create_test_user(seeded_db, RoleEnum.COMMITTEE.value, email="committee_upd404@test.com")
        response = await client.patch("/api/v1/facility-bookings/99999", headers={"Authorization": f"Bearer {committee_token}"}, json={
            "status": "cancelled"
        })
        assert response.status_code == status.HTTP_404_NOT_FOUND