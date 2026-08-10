"""Module 1.10 AI endpoints — mocked Groq, no live provider calls."""
from unittest.mock import MagicMock, patch

import pytest

from app.models.auth import RoleEnum
from app.models.complaint import Complaint, ComplaintCategory
from app.models.staff import MaintenanceStaff
from app.core.config import settings
from tests.conftest import create_test_resident, create_test_user


@pytest.fixture
def ai_enabled(monkeypatch):
    monkeypatch.setattr(settings, "AI_ENABLED", True)
    monkeypatch.setattr(settings, "GROQ_API_KEY", "test-key")
    monkeypatch.setattr(settings, "GROQ_MODEL", "llama-test")


@pytest.mark.asyncio
async def test_classify_disabled_returns_503(client, seeded_db, monkeypatch):
    monkeypatch.setattr(settings, "AI_ENABLED", False)
    _user, _profile, token = create_test_resident(seeded_db)
    resp = await client.post(
        "/api/v1/ai/complaints/classify",
        headers={"Authorization": f"Bearer {token}"},
        json={"description": "Water leakage in bathroom ceiling"},
    )
    assert resp.status_code == 503
    body = resp.json()
    assert body["success"] is False


@pytest.mark.asyncio
async def test_classify_success(client, seeded_db, ai_enabled):
    cat = ComplaintCategory(category_name="Plumbing")
    seeded_db.add(cat)
    seeded_db.commit()
    seeded_db.refresh(cat)

    _user, _profile, token = create_test_resident(seeded_db)

    with patch(
        "app.services.ai_service.chat_completion",
        return_value=('{"category_id": %d, "priority": "high", "confidence": 0.91, "rationale": "Active water leak", "alternative_category_ids": []}' % cat.category_id, 12),
    ):
        resp = await client.post(
            "/api/v1/ai/complaints/classify",
            headers={"Authorization": f"Bearer {token}"},
            json={"description": "Water leakage in bathroom ceiling for two days"},
        )
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["category_id"] == cat.category_id
    assert data["priority"] == "high"
    assert data["category_name"] == "Plumbing"


@pytest.mark.asyncio
async def test_list_maintenance_staff(client, seeded_db):
    admin, token = create_test_user(seeded_db, RoleEnum.ADMIN.name, email="admin@example.com")
    maint_user, _ = create_test_user(seeded_db, RoleEnum.MAINTENANCE.name, email="maint@example.com")
    seeded_db.add(
        MaintenanceStaff(
            user_id=maint_user.user_id,
            specialization="Plumbing",
            experience_years=5,
            is_available=True,
        )
    )
    seeded_db.commit()

    resp = await client.get(
        "/api/v1/admin/maintenance-staff",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200, resp.text
    rows = resp.json()["data"]
    assert len(rows) >= 1
    assert rows[0]["specialization"] == "Plumbing"
    assert "open_task_count" in rows[0]


@pytest.mark.asyncio
async def test_staff_recommendations(client, seeded_db, ai_enabled):
    cat = ComplaintCategory(category_name="Electrical")
    seeded_db.add(cat)
    seeded_db.commit()
    seeded_db.refresh(cat)

    _resident, profile, _rtoken = create_test_resident(seeded_db)
    complaint = Complaint(
        resident_id=profile.resident_id,
        category_id=cat.category_id,
        description="Sparks from the main switchboard",
        priority="critical",
        status="open",
    )
    seeded_db.add(complaint)
    seeded_db.commit()
    seeded_db.refresh(complaint)

    maint_user, _ = create_test_user(seeded_db, RoleEnum.MAINTENANCE.name, email="elec@example.com")
    staff = MaintenanceStaff(
        user_id=maint_user.user_id,
        specialization="Electrical",
        experience_years=8,
        is_available=True,
    )
    seeded_db.add(staff)
    seeded_db.commit()
    seeded_db.refresh(staff)

    admin, token = create_test_user(seeded_db, RoleEnum.ADMIN.name, email="admin2@example.com")

    with patch(
        "app.services.ai_service.chat_completion",
        return_value=(
            '{"rankings": [{"staff_id": %d, "reason": "Electrical specialist"}]}' % staff.staff_id,
            20,
        ),
    ):
        resp = await client.get(
            f"/api/v1/ai/complaints/{complaint.complaint_id}/staff-recommendations",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert resp.status_code == 200, resp.text
    recs = resp.json()["data"]["recommendations"]
    assert recs[0]["staff_id"] == staff.staff_id


@pytest.mark.asyncio
async def test_search_role_scoped_resident(client, seeded_db):
    cat = ComplaintCategory(category_name="General")
    seeded_db.add(cat)
    seeded_db.commit()
    seeded_db.refresh(cat)

    _u1, p1, t1 = create_test_resident(seeded_db, flat_number="A-201", email="r1@example.com")
    _u2, p2, _t2 = create_test_resident(seeded_db, flat_number="A-202", email="r2@example.com")
    seeded_db.add_all(
        [
            Complaint(
                resident_id=p1.resident_id,
                category_id=cat.category_id,
                description="My unique elevator noise complaint alpha",
                priority="medium",
            ),
            Complaint(
                resident_id=p2.resident_id,
                category_id=cat.category_id,
                description="My unique elevator noise complaint beta",
                priority="medium",
            ),
        ]
    )
    seeded_db.commit()

    resp = await client.get(
        "/api/v1/ai/search",
        params={"q": "elevator noise"},
        headers={"Authorization": f"Bearer {t1}"},
    )
    assert resp.status_code == 200, resp.text
    results = resp.json()["data"]["results"]
    complaint_ids = [r["entity_id"] for r in results if r["entity_type"] == "complaint"]
    # Resident 1 must not see resident 2's complaint
    assert len(complaint_ids) == 1


@pytest.mark.asyncio
async def test_chat_mocked(client, seeded_db, ai_enabled, monkeypatch):
    _user, _profile, token = create_test_resident(seeded_db)

    redis_mock = MagicMock()
    redis_mock.incr.return_value = 1
    monkeypatch.setattr("app.services.ai_service.get_redis_client", lambda: redis_mock)

    with patch(
        "app.services.ai_service.chat_completion",
        return_value=(
            '{"reply": "I can help with your complaints.", "citations": [], "refused": false}',
            15,
        ),
    ):
        resp = await client.post(
            "/api/v1/ai/chat",
            headers={"Authorization": f"Bearer {token}"},
            json={"messages": [{"role": "user", "content": "What can you help me with?"}]},
        )
    assert resp.status_code == 200, resp.text
    assert "help" in resp.json()["data"]["reply"].lower()
