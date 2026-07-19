import { FileQuestion } from "lucide-react";

import ErrorState from "../components/feedback/ErrorState";

const NotFound = () => {
  return (
    <ErrorState
      code="404"
      title="Page Not Found"
      description="The page you're trying to access doesn't exist."
      icon={FileQuestion}
    />
  );
};

export default NotFound;