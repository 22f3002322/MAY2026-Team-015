import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import useAiStore from "../../store/aiStore";
import useAuthStore from "../../store/authStore";
import AiStatusBanner from "./AiStatusBanner";
import {
  citationLabel,
  citationPath,
  getSearchEmptyHint,
  resolveStaffRole,
} from "./aiRoleConfig";

const AiSearchPanel = () => {
  const navigate = useNavigate();
  const { role, user, backendRole } = useAuthStore();
  const staffRole = resolveStaffRole(user, backendRole);
  const searchQuery = useAiStore((s) => s.searchQuery);
  const searchResults = useAiStore((s) => s.searchResults);
  const searchReranked = useAiStore((s) => s.searchReranked);
  const searching = useAiStore((s) => s.searching);
  const searchError = useAiStore((s) => s.searchError);
  const search = useAiStore((s) => s.search);
  const closePanel = useAiStore((s) => s.closePanel);

  const [draft, setDraft] = useState(searchQuery || "");
  const hint = getSearchEmptyHint({ role, staffRole });

  const handleResult = (item) => {
    const path = citationPath(item.entity_type, { role, staffRole });
    if (!path) return;
    closePanel();
    navigate(path);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <form
        className="flex gap-2 border-b border-slate-200 p-3 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          search(draft);
        }}
      >
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search complaints and notices…"
          className="h-10 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={searching || draft.trim().length < 2}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {searchError && (
          <div className="mb-3">
            <AiStatusBanner error={searchError} />
          </div>
        )}

        {!searching && searchResults.length === 0 && !searchError && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        )}

        {searchReranked && searchResults.length > 0 && (
          <p className="mb-2 text-[11px] text-slate-400">Results re-ranked by relevance.</p>
        )}

        <ul className="space-y-2">
          {searchResults.map((item) => {
            const path = citationPath(item.entity_type, { role, staffRole });
            const label = citationLabel(item.entity_type, item.entity_id);
            const Wrapper = path ? "button" : "div";
            return (
              <li key={`${item.entity_type}-${item.entity_id}`}>
                <Wrapper
                  type={path ? "button" : undefined}
                  onClick={path ? () => handleResult(item) : undefined}
                  className={`w-full rounded-xl border border-slate-200 bg-white p-3 text-left dark:border-slate-700 dark:bg-slate-800/60 ${
                    path
                      ? "hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {label}
                    </span>
                    <span className="truncate text-xs text-slate-400">{item.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                    {item.snippet}
                  </p>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AiSearchPanel;
