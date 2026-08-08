import { useEffect, useState } from "react";
import { CheckCircle2, UserCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import useAuthStore from "../../store/authStore";

const PendingVerifications = () => {
  const { fetchPendingVerifications, verifyUserAccount, pendingVerifications, backendRole } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  // Only committee members can call this endpoint — hide entirely for Admin
  const isCommittee = String(backendRole || "").toLowerCase() === "committee";

  const loadPending = async () => {
    if (!isCommittee) return;
    setLoading(true);
    await fetchPendingVerifications();
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, [isCommittee]);

  const handleVerify = async (userId, name) => {
    setVerifyingId(userId);
    const res = await verifyUserAccount(userId);
    if (res.success) {
      toast.success(res.message || `Account for ${name || "User"} verified successfully!`);
    } else {
      toast.error(res.message || "Verification failed.");
    }
    setVerifyingId(null);
  };

  // Don't render for non-committee users (Admin cannot call this API)
  if (!isCommittee) return null;

  if (!pendingVerifications || pendingVerifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Pending Account Verifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New self-registered accounts requiring committee verification before activation.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-xs py-1.5 px-3"
          onClick={loadPending}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {pendingVerifications.map((item) => (
          <div
            key={item.user_id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.full_name || "New Registrant"}
                </span>
                <Badge variant="warning" className="capitalize text-xs">
                  {item.role || "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email: {item.email} {item.phone ? `| Phone: ${item.phone}` : ""}
              </p>
            </div>

            <Button
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-4"
              loading={verifyingId === item.user_id}
              onClick={() => handleVerify(item.user_id, item.full_name)}
              icon={CheckCircle2}
            >
              Verify Account
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PendingVerifications;
