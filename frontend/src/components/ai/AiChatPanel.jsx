import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send } from "lucide-react";

import useAiStore from "../../store/aiStore";
import useAuthStore from "../../store/authStore";
import AiStatusBanner from "./AiStatusBanner";
import {
  citationLabel,
  citationPath,
  getAssistantHint,
  getStarterChips,
  resolveStaffRole,
} from "./aiRoleConfig";

const AiChatPanel = () => {
  const navigate = useNavigate();
  const { role, user, backendRole } = useAuthStore();
  const staffRole = resolveStaffRole(user, backendRole);
  const messages = useAiStore((s) => s.messages);
  const sending = useAiStore((s) => s.sending);
  const error = useAiStore((s) => s.error);
  const sendMessage = useAiStore((s) => s.sendMessage);
  const closePanel = useAiStore((s) => s.closePanel);

  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const starters = getStarterChips({ role, staffRole });
  const hint = getAssistantHint({ role, staffRole });

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const handleSend = async (text) => {
    const value = (text ?? draft).trim();
    if (!value || sending) return;
    setDraft("");
    await sendMessage(value);
  };

  const handleCitation = (citation) => {
    const path = citationPath(citation.entity_type, { role, staffRole });
    if (!path) return;
    closePanel();
    navigate(path);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
            <div className="flex flex-wrap gap-2">
              {starters.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(chip)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs text-slate-700 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={`${msg.role}-${idx}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" &&
                Array.isArray(msg.citations) &&
                msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.citations.map((c) => {
                      const path = citationPath(c.entity_type, { role, staffRole });
                      const label = citationLabel(c.entity_type, c.entity_id);
                      if (!path) {
                        return (
                          <span
                            key={`${c.entity_type}-${c.entity_id}`}
                            className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            {label}
                          </span>
                        );
                      }
                      return (
                        <button
                          key={`${c.entity_type}-${c.entity_id}`}
                          type="button"
                          onClick={() => handleCitation(c)}
                          className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 pb-2">
          <AiStatusBanner error={error} />
        </div>
      )}

      <form
        className="flex items-end gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about complaints or notices…"
          className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
};

export default AiChatPanel;
