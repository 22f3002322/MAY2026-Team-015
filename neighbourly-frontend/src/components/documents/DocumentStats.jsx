import {
  FileText,
  FolderOpen,
  Upload,
} from "lucide-react";

import Card from "../ui/Card";

import useDocumentStore from "../../store/documentStore";

const DocumentStats = () => {
  const documents = useDocumentStore(
    (state) => state.documents
  );

  const totalDocuments = documents.length;

  const totalCategories = new Set(
    documents.map((doc) => doc.category)
  ).size;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const uploadedThisMonth = documents.filter(
    (doc) => {
      const date = new Date(
        doc.createdAt || doc.uploadedAt
      );

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    }
  ).length;

  const stats = [
    {
      title: "Total Documents",
      value: totalDocuments,
      change: `${totalDocuments}`,
      trend: "up",
      icon: FileText,
    },
    {
      title: "Categories",
      value: totalCategories,
      change: `${totalCategories}`,
      trend: "up",
      icon: FolderOpen,
    },
    {
      title: "Uploaded This Month",
      value: uploadedThisMonth,
      change: `${uploadedThisMonth}`,
      trend: "up",
      icon: Upload,
    },
  ];

  return (
    <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>

                <p className="mt-2 text-sm font-medium text-emerald-600">
                  {item.change}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
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