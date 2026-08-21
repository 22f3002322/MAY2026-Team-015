import { useState } from "react";
import { Sparkles } from "lucide-react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useBlockOptions } from "../../utils/useBlockOptions";
import aiApi, { getAiErrorInfo } from "../../api/aiApi";
import AiStatusBanner from "./AiStatusBanner";

const metricEntries = (obj) =>
  Object.entries(obj || {}).filter(([, value]) => value != null);

const ComplaintSummaryCard = () => {
  const blockOpts = useBlockOptions();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [blockId, setBlockId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const payload = {};
    if (fromDate) payload.from_date = fromDate;
    if (toDate) payload.to_date = toDate;
    if (blockId) payload.block_id = Number(blockId);

    try {
      const res = await aiApi.summarizeComplaints(payload);
      if (res?.success && res.data) {
        setSummary(res.data);
      } else {
        setError({
          kind: "error",
          message: res?.message || "Could not generate a summary.",
        });
      }
    } catch (err) {
      setError(getAiErrorInfo(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Complaint summary"
      subtitle="SQL counts plus an AI narrative. You still decide what to act on."
      action={
        <Button
          size="sm"
          icon={Sparkles}
          loading={loading}
          onClick={handleGenerate}
        >
          Generate summary
        </Button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          From
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          To
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
          Block
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All blocks</option>
            {blockOpts.map((b) => (
              <option key={b.block_id} value={b.block_id}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <AiStatusBanner error={error} className="mb-4" />}

      {!summary && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate a summary of recent complaints. Metrics come from your
          database; the narrative is a suggestion only.
        </p>
      )}

      {summary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {summary.headline}
            </h4>
            {summary.cached && <Badge variant="secondary">Cached</Badge>}
          </div>

          {summary.narrative && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {summary.narrative}
            </p>
          )}

          {summary.metrics && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="text-lg font-semibold">{summary.metrics.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <p className="text-[11px] text-slate-500">Oldest open (days)</p>
                <p className="text-lg font-semibold">
                  {summary.metrics.oldest_open_days ?? "—"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700 sm:col-span-2">
                <p className="text-[11px] text-slate-500">By status</p>
                <p className="mt-1 text-sm">
                  {metricEntries(summary.metrics.by_status)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ") || "—"}
                </p>
              </div>
            </div>
          )}

          {Array.isArray(summary.insights) && summary.insights.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Insights
              </h5>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {summary.insights.map((item, idx) => (
                  <li key={`insight-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(summary.recommended_actions) &&
            summary.recommended_actions.length > 0 && (
              <div>
                <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommended actions
                </h5>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                  {summary.recommended_actions.map((item, idx) => (
                    <li key={`action-${idx}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </Card>
  );
};

export default ComplaintSummaryCard;
