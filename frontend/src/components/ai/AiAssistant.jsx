import { MessageSquare, Search, Sparkles, X } from "lucide-react";

import useAiStore from "../../store/aiStore";
import AiChatPanel from "./AiChatPanel";
import AiSearchPanel from "./AiSearchPanel";

const AiAssistant = () => {
  const isOpen = useAiStore((s) => s.isOpen);
  const tab = useAiStore((s) => s.tab);
  const togglePanel = useAiStore((s) => s.togglePanel);
  const closePanel = useAiStore((s) => s.closePanel);
  const setTab = useAiStore((s) => s.setTab);
  const clearConversation = useAiStore((s) => s.clearConversation);

  return (
    <>
      <button
        type="button"
        onClick={togglePanel}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {isOpen && (
        <section
          className="fixed bottom-24 right-6 z-30 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          aria-label="Neighbourly assistant"
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Neighbourly Assistant
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Complaints and notices
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => clearConversation()}
                className="rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close assistant"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTab("ask")}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium ${
                tab === "ask"
                  ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <MessageSquare size={14} />
              Ask
            </button>
            <button
              type="button"
              onClick={() => setTab("search")}
              className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium ${
                tab === "search"
                  ? "border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Search size={14} />
              Search
            </button>
          </div>

          <div className="min-h-0 flex-1">
            {tab === "ask" ? <AiChatPanel /> : <AiSearchPanel />}
          </div>
        </section>
      )}
    </>
  );
};

export default AiAssistant;
