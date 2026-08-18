import { useState } from "react";
import { Shield, Eye, EyeOff, Copy, CheckCheck, X } from "lucide-react";
import { toast } from "sonner";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import useAuthStore from "../../store/authStore";

const CreateCommitteeModal = ({ open, onClose }) => {
  const { registerCommitteeMember } = useAuthStore();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // holds { email, initial_password } on success
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Full name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const generatedPassword = form.password?.trim() || `Committee@${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await registerCommitteeMember({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: generatedPassword,
      });
      if (res.success) {
        setResult({
          ...(res.data || {}),
          email: form.email.trim(),
          initial_password: res.data?.initial_password || generatedPassword,
        });
        toast.success("Committee member created successfully!");
      } else {
        toast.error(res.message || "Failed to create committee member.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.initial_password) {
      navigator.clipboard.writeText(result.initial_password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setForm({ full_name: "", email: "", phone: "" });
    setResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Add Committee Member"
      onClose={handleClose}
    >
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Shield size={18} className="text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Committee members are auto-verified and provisioned with a temporary password.
              They can log in immediately and change their password via Forgot Password.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. priya@example.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Initial Password <span className="text-xs text-slate-400">(Optional - auto-generates if empty)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Min 8 characters (or leave blank)"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              loading={loading}
              icon={Shield}
            >
              Create Committee Member
            </Button>
          </div>
        </form>
      ) : (
        /* Success screen — show generated password */
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <CheckCheck size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Committee member created!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Share the credentials below securely — the password is only shown once.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Email
              </p>
              <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200">
                {result.email}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Temporary Password
              </p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-sm font-mono bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-amber-800 dark:text-amber-200 break-all">
                  {result.initial_password}
                </p>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                  title="Copy password"
                >
                  {copied ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠ Save this password — it cannot be retrieved again.
              </p>
            </div>
          </div>

          <Button
            className="w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900"
            onClick={handleClose}
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default CreateCommitteeModal;
