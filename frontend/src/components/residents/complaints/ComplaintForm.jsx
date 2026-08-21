import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import Button from "../../ui/Button";
import useComplaintStore from "../../../store/complaintStore";
import { COMPLAINT_PRIORITY } from "../../../utils/adminMaps";
import useAuthStore from "../../../store/authStore";
import aiApi, { getAiErrorInfo } from "../../../api/aiApi";
import AiStatusBanner from "../../ai/AiStatusBanner";

const ComplaintForm = ({
  initialData = null,
  isEdit = false,
  onSubmit,
  onClose,
}) => {
  const categories = useComplaintStore((s) => s.categories);
  const fetchCategories = useComplaintStore((s) => s.fetchCategories);
  const isVerified = useAuthStore((s) => s.isVerified);
  const user = useAuthStore((s) => s.user);
  const canClassify =
    isVerified !== false && user?.isVerified !== false;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category_id: initialData?.category_id || "",
    priority: initialData?.priorityValue || "medium",
    description: initialData?.description || "",
    imageFile: null,
  });
  const [classifyLoading, setClassifyLoading] = useState(false);
  const [classifyError, setClassifyError] = useState(null);
  const [classifyHint, setClassifyHint] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      onSubmit({
        description: formData.description,
        priority: formData.priority,
      });
      return;
    }

    const categoryId =
      Number(formData.category_id) || categories[0]?.category_id;
    if (!categoryId) return;

    const description = formData.title
      ? `${formData.title}\n\n${formData.description}`
      : formData.description;

    onSubmit({
      category_id: categoryId,
      description,
      priority: formData.priority,
      imageFile: formData.imageFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!isEdit && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Complaint Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleChange("category_id", e.target.value)}
              required
              className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => handleChange("priority", e.target.value)}
          className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600 dark:border-slate-700"
        >
          {COMPLAINT_PRIORITY.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          rows={4}
          required
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the issue in detail..."
          className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        {canClassify && (
          <div className="mt-3 space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={classifyLoading}
              disabled={classifyLoading || formData.description.trim().length < 3}
              icon={Sparkles}
              onClick={async () => {
                const text = [formData.title, formData.description]
                  .filter((part) => String(part || "").trim())
                  .join("\n\n");
                if (formData.description.trim().length < 3) return;
                setClassifyLoading(true);
                setClassifyError(null);
                try {
                  const res = await aiApi.classifyComplaint(text);
                  if (res?.success && res.data) {
                    const suggested = res.data;
                    setFormData((prev) => ({
                      ...prev,
                      category_id: suggested.category_id
                        ? String(suggested.category_id)
                        : prev.category_id,
                      priority: String(
                        suggested.priority || prev.priority || "medium"
                      ).toLowerCase(),
                    }));
                    setClassifyHint({
                      rationale: suggested.rationale,
                      confidence: suggested.confidence,
                      alternatives: suggested.alternative_categories || [],
                      categoryName: suggested.category_name,
                    });
                  } else {
                    setClassifyError({
                      kind: "error",
                      message: res?.message || "Could not classify this complaint.",
                    });
                  }
                } catch (err) {
                  setClassifyError(getAiErrorInfo(err));
                } finally {
                  setClassifyLoading(false);
                }
              }}
            >
              Suggest category & priority
            </Button>
            {classifyError && <AiStatusBanner error={classifyError} />}
            {classifyHint && !classifyError && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-600 dark:border-indigo-900/40 dark:bg-indigo-950/20 dark:text-slate-300">
                <p>
                  Suggested <span className="font-medium">{classifyHint.categoryName}</span>
                  {typeof classifyHint.confidence === "number"
                    ? ` (${Math.round(classifyHint.confidence * 100)}% confidence)`
                    : ""}
                  . You can still change category or priority before submitting.
                </p>
                {classifyHint.rationale && (
                  <p className="mt-1">{classifyHint.rationale}</p>
                )}
                {classifyHint.alternatives.length > 0 && (
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    Alternatives:{" "}
                    {classifyHint.alternatives
                      .map((alt) => alt.category_name)
                      .join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!isEdit && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Attach Image{" "}
            <span className="text-xs text-slate-400">(Optional - max 5 MB)</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData((prev) => ({ ...prev, imageFile: file }));
              }
            }}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
          />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? "Update Complaint" : "Submit Complaint"}
        </Button>
      </div>
    </form>
  );
};

export default ComplaintForm;
