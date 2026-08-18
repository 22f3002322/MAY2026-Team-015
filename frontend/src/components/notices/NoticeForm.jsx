import { useState } from "react";
import { toast } from "sonner";

import Input from "../ui/Input";
import Button from "../ui/Button";
import useNoticeStore from "../../store/noticeStore";
import { NOTICE_PRIORITY } from "../../utils/adminMaps";

const NoticeForm = ({ initialData = null, onClose }) => {
  const addNotice = useNoticeStore((state) => state.addNotice);
  const updateNotice = useNoticeStore((state) => state.updateNotice);

  const [form, setForm] = useState({
    title: initialData?.title || "",
    priority: initialData?.priority || "Normal",
    status: initialData?.status || "Published",
    expiryDate: initialData?.expiryDate || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required.";
    if (!form.description.trim()) newErrors.description = "Description is required.";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (initialData) {
        const res = await updateNotice({ ...initialData, ...form });
        if (res?.success === false) {
          toast.error(res.message || "Update failed.");
          return;
        }
        toast.success("Notice updated.");
      } else {
        const res = await addNotice(form);
        if (res?.success === false) {
          toast.error(res.message || "Publish failed.");
          return;
        }
        toast.success("Notice published.");
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Notice Title"
        value={form.title}
        error={errors.title}
        placeholder="Enter Notice Title..."
        onChange={(e) => handleChange("title", e.target.value)}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            {NOTICE_PRIORITY.map((o) => (
              <option key={o.value} value={o.label}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 px-4"
          >
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      <Input
        label="Expiry Date (optional)"
        type="date"
        value={form.expiryDate}
        onChange={(e) => handleChange("expiryDate", e.target.value)}
      />

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Notice details..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {initialData ? "Update Notice" : "Publish Notice"}
        </Button>
      </div>
    </form>
  );
};

export default NoticeForm;
