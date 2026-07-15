import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import useDocumentStore from "../../store/documentStore";

const UploadDocumentForm = ({
  initialData = null,
  onClose,
}) => {
  const addDocument = useDocumentStore(
    (state) => state.addDocument
  );

  const updateDocument = useDocumentStore(
    (state) => state.updateDocument
  );

  const [form, setForm] = useState(
    initialData || {
      title: "",
      category: "General",
      type: "PDF",
      uploadedBy: "",
      description: "",
      file: null,
    }
  );

  const [errors, setErrors] = useState({});

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
        "Document title is required.";

    if (!form.uploadedBy.trim())
      newErrors.uploadedBy =
        "Uploader name is required.";

    if (!form.description.trim())
      newErrors.description =
        "Description is required.";

    if (!initialData && !form.file)
      newErrors.file =
        "Please upload a document.";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }

    const documentData = {
      ...form,
      fileName:
        form.file?.name ||
        initialData?.fileName ||
        "document.pdf",
    };

    if (initialData) {
      updateDocument(
        initialData.id,
        {
          ...initialData,
          ...documentData,
          updatedAt:
            new Date().toISOString(),
        }
      );
    } else {
      addDocument({
        ...documentData,
        id: Date.now(),
        documentId: `DOC-${Date.now()
          .toString()
          .slice(-5)}`,
        uploadedAt:
          new Date().toLocaleDateString(),
        createdAt:
          new Date().toISOString(),
      });
    }

    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Input label="Document Title"
        value={form.title}
        error={errors.title}
        onChange={(e) = placeholder="Enter Document Title..." >
          handleChange(
            "title",
            e.target.value
          )
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        {/* Category */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
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
            <option>Legal</option>
            <option>Finance</option>
            <option>Maintenance</option>
            <option>Parking</option>
            <option>Safety</option>
          </select>
        </div>

        {/* File Type */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            File Type
          </label>

          <select
            value={form.type}
            onChange={(e) =>
              handleChange(
                "type",
                e.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none focus:border-indigo-600"
          >
            <option>PDF</option>
            <option>DOCX</option>
            <option>XLSX</option>
            <option>JPG</option>
            <option>PNG</option>
          </select>
        </div>

        <Input label="Uploaded By"
          value={form.uploadedBy}
          error={errors.uploadedBy}
          onChange={(e) = placeholder="Enter Uploaded By..." >
            handleChange(
              "uploadedBy",
              e.target.value
            )
          }
        />

        {/* Upload */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Upload File
          </label>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            onChange={(e) =>
              handleChange(
                "file",
                e.target.files[0]
              )
            }
            className="block w-full rounded-xl border border-slate-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-700"
          />

          {errors.file && (
            <p className="mt-1 text-sm text-red-600">
              {errors.file}
            </p>
          )}

          {form.file && (
            <p className="mt-2 text-sm text-emerald-600">
              Selected: {form.file.name}
            </p>
          )}

          {initialData &&
            !form.file && (
              <p className="mt-2 text-sm text-slate-500">
                Current File:{" "}
                {initialData.fileName}
              </p>
            )}
        </div>
      </div>

      {/* Description */}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          rows={5}
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          placeholder="Enter document description..."
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
            ? "Update Document"
            : "Upload Document"}
        </Button>
      </div>
    </form>
  );
};

export default UploadDocumentForm;