import { Sparkles } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import useAiStore from "../../../store/aiStore";

const QuickActions = () => {
  const openPanel = useAiStore((s) => s.openPanel);

  return (
    <Card
      title="Quick Actions"
      subtitle="Ask about your complaints and notices"
    >
      <Button
        variant="outline"
        className="h-14 w-full justify-start sm:w-auto"
        icon={Sparkles}
        onClick={() => openPanel("ask")}
      >
        Ask Neighbourly
      </Button>
    </Card>
  );
};

export default QuickActions;
