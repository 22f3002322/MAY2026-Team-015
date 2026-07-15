import { ServerCrash } from "lucide-react";

import ErrorState from "../components/feedback/ErrorState";

const ServerError = () => {
  return (
    <ErrorState
      code="500"
      title="Internal Server Error"
      description="Something went wrong on our side. Please try again later."
      icon={ServerCrash}
    />
  );
};

export default ServerError;