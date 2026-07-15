import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LogIn } from "lucide-react";
import { toast } from "sonner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useAuthStore from "../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "resident") {
        navigate("/resident/dashboard");
      } else if (role === "staff") {
        navigate("/staff/dashboard");
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = login(email, password);
    
    if (result.success) {
      toast.success(`Welcome back!`);
      if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else if (result.role === "resident") {
        navigate("/resident/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const autofillAdmin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
  };

  const autofillResident = () => {
    setEmail("william@example.com");
    setPassword("password123");
  };

  const autofillSecurity = () => {
    setEmail("security@example.com");
    setPassword("staff123");
  };

  const autofillMaintenance = () => {
    setEmail("maintenance@example.com");
    setPassword("staff123");
  };

  const autofillHousekeeping = () => {
    setEmail("housekeeping@example.com");
    setPassword("staff123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Neighbourly
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full mt-2"
              loading={loading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-4">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Button
                variant="outline"
                className="text-xs py-2"
                onClick={autofillAdmin}
              >
                Admin
              </Button>
              <Button
                variant="outline"
                className="text-xs py-2"
                onClick={autofillResident}
              >
                Resident
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="text-[10px] py-1.5 px-1 truncate"
                onClick={autofillSecurity}
                title="Autofill Security staff role"
              >
                Security
              </Button>
              <Button
                variant="outline"
                className="text-[10px] py-1.5 px-1 truncate"
                onClick={autofillMaintenance}
                title="Autofill Maintenance staff role"
              >
                Maint.
              </Button>
              <Button
                variant="outline"
                className="text-[10px] py-1.5 px-1 truncate"
                onClick={autofillHousekeeping}
                title="Autofill Housekeeping staff role"
              >
                Housekeep.
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
