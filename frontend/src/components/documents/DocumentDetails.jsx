import {
  FileText,
  FolderOpen,
  User,
  Calendar,
  HardDrive,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const DocumentDetails = ({
  document,
  onClose,
}) => {
  if (!document) return null;

  const getTypeVariant = (type) => {
    switch (type) {
      case "PDF":
        return "danger";
      case "DOCX":
        return "primary";
      case "XLSX":
        return "success";
      case "JPG":
      case "PNG":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleDownload = () => {
    if (document.file) {
      const url = URL.createObjectURL(
        document.file
      );

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        document.file.name ||
        document.fileName;

      link.click();

      URL.revokeObjectURL(url);
    } else {
      toast.error(
        "No file available for download."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Document Details
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {document.documentId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="space-y-8 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <FileText size={30} />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                {document.title}
              </h3>

              <div className="mt-2">
                <Badge
                  variant={getTypeVariant(
                    document.type
                  )}
                >
                  {document.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Info
              icon={FolderOpen}
              label="Category"
              value={document.category}
            />

            <Info
              icon={HardDrive}
              label="File Size"
              value={
                document.size || "--"
              }
            />

            <Info
              icon={User}
              label="Uploaded By"
              value={
                document.uploadedBy
              }
            />

            <Info
              icon={Calendar}
              label="Upload Date"
              value={
                document.uploadedAt ||
                document.uploadDate
              }
            />
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Description
            </h4>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 p-5 leading-7 text-slate-600">
              {document.description}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              File
            </h4>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {document.fileName}
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {document.size || "--"}
                </p>
              </div>

              <Button
                onClick={
                  handleDownload
                }
              >
                <Download
                  size={18}
                />
                Download
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Info = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex gap-3">
    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>

    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="font-medium text-slate-800 dark:text-slate-100">
        {value || "--"}
      </p>
    </div>
  </div>
);

export default DocumentDetails;