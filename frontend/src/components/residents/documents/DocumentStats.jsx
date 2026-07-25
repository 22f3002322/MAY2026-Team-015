import {
  FileText,
  Download,
  FolderOpen,
  TrendingUp,
} from "lucide-react";

import Card from "../../ui/Card";

import useDocumentStore from "../../../store/documentStore";

const DocumentStats = () => {
  const documents = useDocumentStore(
    (state) => state.documents
  );

  const recentDownloads =
    useDocumentStore(
      (state) => state.recentDownloads
    );

  const totalDocuments =
    documents.length;

  const totalDownloads = documents.reduce(
  (sum, document) => sum + Number(document.downloads || 0),
  0
);

  const totalCategories =
    new Set(
      documents.map(
        (document) =>
          document.category
      )
    ).size;

  const stats = [
    {
      title: "Total Documents",
      value: totalDocuments,
      icon: FileText,
      color:
        "bg-indigo-100 text-indigo-600",
    },
    {
      title: "My Downloads",
      value: recentDownloads.length,
      icon: Download,
      color:
        "bg-green-100 text-green-600",
    },
    {
      title: "Categories",
      value: totalCategories,
      icon: FolderOpen,
      color:
        "bg-amber-100 text-amber-600",
    },
    {
      title: "Total Downloads",
      value: totalDownloads,
      icon: TrendingUp,
      color:
        "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>

              </div>

              <div
                className={`rounded-xl p-3 ${item.color}`}
              >
                <Icon size={24} />
              </div>

            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentStats;