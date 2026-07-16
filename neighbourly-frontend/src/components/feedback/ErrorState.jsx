import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

import Button from "../ui/Button";

const ErrorState = ({
  code = "404",
  title = "Page Not Found",
  description = "The page you are looking for doesn't exist or has been moved.",
  icon: Icon = AlertTriangle,
  showHome = true,
}) => {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-slate-800">
          <Icon
            size={48}
            className="text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />
        </div>

        <h1 className="text-7xl font-extrabold text-indigo-600 dark:text-indigo-400">
          {code}
        </h1>

        <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-4 text-slate-500 dark:text-slate-400">
          {description}
        </p>

        {showHome && (
          <div className="mt-8 flex justify-center">
            <Link to="/" aria-label="Go back to dashboard home">
              <Button icon={Home}>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorState;