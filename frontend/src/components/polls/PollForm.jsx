import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import usePollStore from "../../store/pollStore";
import { toast } from "sonner";

const categories = [
  "Community",
  "Parking",
  "Finance",
  "Events",
];

const PollForm = ({ initialData = null, onClose }) => {
  const createPoll = usePollStore((state) => state.createPoll);
  const updatePoll = usePollStore((state) => state.updatePoll);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    question: initialData?.question || "",
    category: initialData?.category || "Community",
    startDate: initialData?.start_date || initialData?.startDate || new Date().toISOString().split("T")[0],
    endDate: initialData?.end_date || initialData?.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    options: initialData?.options?.length
      ? initialData.options.map((o) => ({ option: o.option_text || o.option || "" }))
      : [{ option: "" }, { option: "" }],
  });

  const [errors, setErrors] = useState({});

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = { option: value };
    setForm((prev) => ({
      ...prev,
      options: updated,
    }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { option: "" }],
    }));
  };

  const removeOption = (index) => {
    if (form.options.length <= 2) return;
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.question.trim()) {
      newErrors.question = "Question is required.";
    }
    if (!form.startDate) {
      newErrors.startDate = "Start date is required.";
    }
    if (!form.endDate) {
      newErrors.endDate = "End date is required.";
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      newErrors.endDate = "End date must be after start date.";
    }

    const filledOptions = form.options.filter((o) => o.option.trim());
    if (filledOptions.length < 2) {
      newErrors.options = "At least 2 non-empty poll options are required.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    const payload = {
      question: form.question.trim(),
      options: form.options.filter((o) => o.option.trim()).map((o) => ({ option_text: o.option.trim() })),
      start_date: form.startDate,
      end_date: form.endDate,
      allow_multiple_votes: false,
      anonymous: false,
    };

    let res;
    if (initialData?.poll_id || initialData?.id) {
      const pollId = initialData.poll_id || initialData.id;
      res = await updatePoll(pollId, {
        question: payload.question,
        end_date: payload.end_date,
      });
    } else {
      res = await createPoll(payload);
    }

    setLoading(false);

    if (res && res.success) {
      toast.success(res.message || (initialData ? "Poll updated!" : "Poll created successfully!"));
      onClose();
    } else {
      toast.error(res?.message || "Failed to save poll.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Poll Question"
        value={form.question}
        error={errors.question}
        placeholder="e.g. Should we host a weekend community yoga session?"
        onChange={(e) => handleChange("question", e.target.value)}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Start Date"
          type="date"
          min={today}
          value={form.startDate}
          error={errors.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />

        <Input
          label="End Date"
          type="date"
          min={form.startDate || today}
          value={form.endDate}
          error={errors.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Poll Options (min 2)
          </label>

          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            + Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {form.options.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={item.option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>

              {form.options.length > 2 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {errors.options && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.options}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {loading ? "Saving..." : initialData ? "Update Poll" : "Create Poll"}
        </Button>
      </div>
    </form>
  );
};

export default PollForm;