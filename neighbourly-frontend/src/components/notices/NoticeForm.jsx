import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import useNoticeStore from "../../store/noticeStore";

const NoticeForm = ({
  initialData = null,
  onClose,
}) => {
  const addNotice = useNoticeStore(
    (state) => state.addNotice
  );

  const updateNotice = useNoticeStore(
    (state) => state.updateNotice
  );

  const [form, setForm] = useState(
    initialData || {
      title: "",
      category: "General",
      priority: "Medium",
      status: "Published",
      author: "",
      publishDate: "",
      expiryDate: "",
      description: "",
    }
  );

  const [errors, setErrors] = useState({});

  const today = new Date()
    .toISOString()
    .split("T")[0];

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

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim())
      newErrors.title =
        "Title is required.";

    if (!form.author.trim())
      newErrors.author =
        "Author is required.";

    if (!form.publishDate)
      newErrors.publishDate =
        "Publish date is required.";

    if (!form.expiryDate)
      newErrors.expiryDate =
        "Expiry date is required.";

    if (
      form.publishDate &&
      form.expiryDate &&
      form.expiryDate < form.publishDate
    ) {
      newErrors.expiryDate =
        "Expiry date cannot be before publish date.";
    }

    if (!form.description.trim())
      newErrors.description =
        "Description is required.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const noticeData = {
      ...form,
    };

    if (initialData) {
      updateNotice({
        ...initialData,
        ...noticeData,
        updatedAt:
          new Date().toISOString(),
      });
    } else {
      addNotice(noticeData);
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Input
        label="Notice Title"
        value={form.title}
        error={errors.title}
        onChange={(e) =>
          handleChange(
            "title",
            e.target.value
          )
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {/* Category */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            value={form.category}
            onChange={(e) =>
              handleChange(
                "category",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>General</option>
            <option>Maintenance</option>
            <option>Meeting</option>
            <option>Parking</option>
            <option>Safety</option>
            <option>Events</option>
          </select>
        </div>

        {/* Priority */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Priority
          </label>

          <select
            value={form.priority}
            onChange={(e) =>
              handleChange(
                "priority",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        {/* Status */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>

        <Input
          label="Author"
          value={form.author}
          error={errors.author}
          onChange={(e) =>
            handleChange(
              "author",
              e.target.value
            )
          }
        />

        {/* Publish Date */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Publish Date
          </label>

          <input
            type="date"
            min={today}
            value={form.publishDate}
            onChange={(e) =>
              handleChange(
                "publishDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />

          {errors.publishDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.publishDate}
            </p>
          )}
        </div>

        {/* Expiry Date */}

        <div>
          <label className="mb-2 block text-sm font-medium">
            Expiry Date
          </label>

          <input
            type="date"
            min={
              form.publishDate ||
              today
            }
            value={form.expiryDate}
            onChange={(e) =>
              handleChange(
                "expiryDate",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          />

          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">
              {errors.expiryDate}
            </p>
          )}
        </div>
      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          rows={6}
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          placeholder="Enter notice description..."
          className="w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-indigo-600"
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Notice"
            : "Publish Notice"}
        </Button>
      </div>
    </form>
  );
};

export default NoticeForm;