import Button from "./Button";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl">

        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h2>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>

        <div className="mt-8 flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelText}
          </Button>

          <Button
            variant="danger"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>

        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;