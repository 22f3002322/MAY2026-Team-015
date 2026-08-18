import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LogIn, UserPlus, KeyRound } from "lucide-react";
import { toast } from "sonner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roleSelection, setRoleSelection] = useState("Resident");
  
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login, signup, forgotPassword, isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "resident") {
        navigate("/resident/dashboard");
      } else if (role === "staff") {
        navigate("/staff/visitors");
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      if (!email || !password || !fullName) {
        toast.error("Please fill in required fields (Name, Email, Password)");
        return;
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }

      setLoading(true);
      const result = await signup({
        email,
        password,
        full_name: fullName,
        phone: phone || undefined,
        role: roleSelection,
      });

      if (result.success) {
        toast.success(result.message);
        setIsSignup(false);
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    } else {
      if (!email || !password) {
        toast.error("Please enter email and password");
        return;
      }

      setLoading(true);
      const result = await login(email, password);

      if (result.success) {
        toast.success("Welcome back!");
        if (result.role === "admin") {
          navigate("/admin/dashboard");
        } else if (result.role === "resident") {
          navigate("/resident/dashboard");
        } else {
          navigate("/staff/visitors");
        }
      } else {
        toast.error(result.message);
      }
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    setForgotLoading(true);
    const result = await forgotPassword(forgotEmail);
    if (result.success) {
      toast.success(result.message);
      setForgotModalOpen(false);
      setForgotEmail("");
    } else {
      toast.error(result.message);
    }
    setForgotLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Neighbourly
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {isSignup ? "Create a new account" : "Sign in to your account"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mb-4 flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              !isSignup
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            onClick={() => setIsSignup(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              isSignup
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
            onClick={() => setIsSignup(true)}
          >
            Register
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <Input
                  label="Full Name *"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={roleSelection}
                    onChange={(e) => setRoleSelection(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
                  >
                    <option value="Resident">Resident</option>
                    <option value="Maintenance">Maintenance Staff</option>
                    <option value="Security">Security Guard</option>
                  </select>
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </>
            )}

            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "Min 8 characters" : "Enter your password"}
              required
            />

            {!isSignup && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              icon={isSignup ? UserPlus : LogIn}
            >
              {isSignup ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotModalOpen}
        title="Forgot Password"
        onClose={() => setForgotModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPasswordSubmit}
              loading={forgotLoading}
              icon={KeyRound}
            >
              Send Reset Link
            </Button>
          </div>
        }
      >
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your registered email address and we will send you a password reset link.
          </p>
          <Input
            label="Email Address *"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="e.g. resident@example.com"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default Login;
