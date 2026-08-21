const KIND_STYLES = {
  unavailable:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  rate_limit:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  unverified:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
  forbidden:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300",
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300",
};

const KIND_DEFAULTS = {
  unavailable: "AI is temporarily unavailable. Core society features still work.",
  rate_limit: "Chat rate limit exceeded. Please wait a minute and try again.",
  unverified:
    "Some AI suggestions are unavailable until your account is verified.",
};

const AiStatusBanner = ({ error, kind, message, className = "" }) => {
  const resolvedKind = error?.kind || kind;
  const resolvedMessage =
    message || error?.message || KIND_DEFAULTS[resolvedKind] || "Something went wrong.";

  if (!resolvedKind && !resolvedMessage) return null;

  const style = KIND_STYLES[resolvedKind] || KIND_STYLES.error;

  return (
    <div
      role="status"
      className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${style} ${className}`}
    >
      {resolvedMessage}
    </div>
  );
};

export default AiStatusBanner;
