import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import { isPlainOtp } from "../../../store/visitorStore";

const getVariant = (statusValue, status) => {
  const v = String(statusValue || status || "").toLowerCase();
  if (v === "expected") return "warning";
  if (v === "arrived") return "primary";
  if (v === "denied") return "danger";
  if (v === "departed") return "success";
  return "default";
};

const VisitorDetails = ({ visitor, onClose }) => {
  if (!visitor) return null;

  const showOtp = isPlainOtp(visitor.otp);

  return (
    <Modal open={!!visitor} title="Visitor Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visitor Name
            </p>
            <p className="font-semibold">{visitor.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Phone Number
            </p>
            <p className="font-semibold">{visitor.phone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Purpose</p>
            <p className="font-semibold">{visitor.purpose}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visit Date
            </p>
            <p className="font-semibold">{visitor.date}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visit Time
            </p>
            <p className="font-semibold">{visitor.visitTime}</p>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>
            <Badge variant={getVariant(visitor.statusValue, visitor.status)}>
              {visitor.status}
            </Badge>
          </div>

          {showOtp ? (
            <div className="col-span-2 flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Visitor Verification OTP
              </p>
              <p className="mt-1 text-3xl font-bold tracking-widest text-indigo-700 dark:text-indigo-300">
                {visitor.otp}
              </p>
              <p className="mt-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Share this OTP with the visitor to verify entry at the gate.
              </p>
            </div>
          ) : visitor.otpSent || visitor.statusValue === "expected" ? (
            <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              We couldn't load the OTP just now. Try refreshing this page --
              it stays available here as long as the visit is still expected.
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Request Created
          </p>
          <p className="font-semibold">
            {visitor.createdAt
              ? new Date(visitor.createdAt).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default VisitorDetails;