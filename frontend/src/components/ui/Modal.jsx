import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({
  open,
  title,
  children,
  onClose,
  size = "lg",
  footer,
}) => {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) =>
              e.stopPropagation()
            }
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{
              duration: 0.2,
            }}
            className={`
              w-full
              ${sizes[size]}
              rounded-2xl
              border
              border-slate-200
              dark:border-slate-800
              bg-white
              dark:bg-slate-900
              shadow-2xl
              overflow-hidden
            `}
          >
            {/* Header */}

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-slate-900 dark:text-white"
              >
                {title}
              </h2>

              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5 text-slate-700 dark:text-slate-300">
              {children}
            </div>

            {/* Footer */}

            {footer && (
              <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;