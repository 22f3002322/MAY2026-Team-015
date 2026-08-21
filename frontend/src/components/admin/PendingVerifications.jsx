import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import useAuthStore from "../../store/authStore";
import useResidentStore from "../../store/residentStore";
import useApartmentStore from "../../store/apartmentStore";
import { OCCUPANCY_UI_OPTIONS, occupancyToApi } from "../../utils/adminMaps";

const PendingVerifications = () => {
  const {
    fetchPendingVerifications,
    verifyUserAccount,
    pendingVerifications,
    backendRole,
  } = useAuthStore();
  const fetchResidents = useResidentStore((s) => s.fetchResidents);
  const flats = useApartmentStore((s) => s.flats);
  const fetchFlats = useApartmentStore((s) => s.fetchFlats);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [occupancyByUser, setOccupancyByUser] = useState({});
  const [flatByUser, setFlatByUser] = useState({});

  const isCommittee = String(backendRole || "").toLowerCase() === "committee";

  const vacantFlats = useMemo(
    () =>
      (flats || []).filter(
        (f) => String(f.occupancy_status || "").toLowerCase() === "vacant"
      ),
    [flats]
  );

  const loadPending = async () => {
    if (!isCommittee) return;
    setLoading(true);
    setFetchError(null);
    const res = await fetchPendingVerifications();
    if (!res?.success) {
      setFetchError(res?.message || "Could not load pending verifications.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
    if (isCommittee) {
      fetchFlats({ occupancy_status: "vacant" }).catch(() => fetchFlats());
    }
  }, [isCommittee]);

  const handleVerify = async (item) => {
    const role = String(item.role || "").toLowerCase();
    const isResident = role === "resident";
    const existingFlatId = item.flat_id;
    const selectedFlatId = flatByUser[item.user_id] || existingFlatId;

    if (isResident && !selectedFlatId) {
      toast.error("Select a vacant flat before verifying this resident.");
      return;
    }

    const uiOcc = occupancyByUser[item.user_id] || "Owner";
    const occupancyType = occupancyToApi(uiOcc) || "Owner";

    setVerifyingId(item.user_id);
    const res = await verifyUserAccount(item.user_id, {
      occupancyType,
      flatId: isResident && !existingFlatId ? Number(selectedFlatId) : undefined,
    });
    if (res?.success) {
      toast.success(
        res.message || `Account for ${item.full_name || "User"} verified.`
      );
      await fetchResidents();
      await fetchFlats();
      await loadPending();
    } else {
      toast.error(res?.message || "Verification failed.");
    }
    setVerifyingId(null);
  };

  if (!isCommittee) return null;

  if (fetchError) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-red-700 dark:text-red-300">{fetchError}</p>
          <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={loadPending}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (loading && (!pendingVerifications || pendingVerifications.length === 0)) {
    return null;
  }

  if (!pendingVerifications || pendingVerifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Pending Account Verifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assign a vacant flat (residents) and occupancy type, then approve.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="px-3 py-1.5 text-xs"
          onClick={loadPending}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {pendingVerifications.map((item) => {
          const isResident = String(item.role || "").toLowerCase() === "resident";
          const hasExistingFlat = Boolean(item.flat_id);

          return (
            <div
              key={item.user_id}
              className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.full_name || "New Registrant"}
                  </span>
                  <Badge variant="warning" className="text-xs capitalize">
                    {item.role || "Pending"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Email: {item.email} {item.phone ? `| Phone: ${item.phone}` : ""}
                </p>
                {hasExistingFlat ? (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Requested flat: {item.block_name ? `${item.block_name} · ` : ""}
                    {item.flat_number || `#${item.flat_id}`}
                  </p>
                ) : null}
              </div>

              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                {isResident && !hasExistingFlat ? (
                  <select
                    value={flatByUser[item.user_id] || ""}
                    onChange={(e) =>
                      setFlatByUser((prev) => ({
                        ...prev,
                        [item.user_id]: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">Select vacant flat…</option>
                    {vacantFlats.map((f) => (
                      <option key={f.flat_id} value={f.flat_id}>
                        {f.block_name || f.block || "Block"} · {f.flat_number}
                      </option>
                    ))}
                  </select>
                ) : null}

                {isResident ? (
                  <select
                    value={occupancyByUser[item.user_id] || "Owner"}
                    onChange={(e) =>
                      setOccupancyByUser((prev) => ({
                        ...prev,
                        [item.user_id]: e.target.value,
                      }))
                    }
                    className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    {OCCUPANCY_UI_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : null}

                <Button
                  className="w-full bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-700 sm:w-auto"
                  loading={verifyingId === item.user_id}
                  onClick={() => handleVerify(item)}
                  icon={CheckCircle2}
                >
                  Verify Account
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PendingVerifications;
