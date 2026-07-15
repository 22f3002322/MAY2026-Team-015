import { useState } from "react";

import Input from "../ui/Input";
import Button from "../ui/Button";

import usePollStore from "../../store/pollStore";

const categories = [
  "Community",
  "Parking",
  "Finance",
  "Events",
];

const PollForm = ({
  initialData = null,
  onClose,
}) => {
  const addPoll = usePollStore(
    (state) => state.addPoll
  );

  const updatePoll = usePollStore(
    (state) => state.updatePoll
  );

  const [form, setForm] = useState(
    initialData || {
      question: "",
      category: "Community",
      startDate: "",
      endDate: "",
      status: "Upcoming",
      totalVotes: 0,
      options: [
        {
          option: "",
          votes: 0,
        },
        {
          option: "",
          votes: 0,
        },
      ],
    }
  );

  const [errors, setErrors] =
    useState({});

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleOptionChange = (
    index,
    value
  ) => {
    const updated = [...form.options];

    updated[index] = {
      ...updated[index],
      option: value,
    };

    setForm((prev) => ({
      ...prev,
      options: updated,
    }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        {
          option: "",
          votes: 0,
        },
      ],
    }));
  };

  const removeOption = (
    index
  ) => {
    if (form.options.length <= 2)
      return;

    setForm((prev) => ({
      ...prev,
      options:
        prev.options.filter(
          (_, i) => i !== index
        ),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (
      !form.question.trim()
    ) {
      newErrors.question =
        "Question is required.";
    }

    if (!form.startDate) {
      newErrors.startDate =
        "Start date is required.";
    }

    if (!form.endDate) {
      newErrors.endDate =
        "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      form.endDate <
      form.startDate
    ) {
      newErrors.endDate =
        "End date must be after start date.";
    }

    const emptyOption =
      form.options.some(
        (item) =>
          !item.option.trim()
      );

    if (emptyOption) {
      newErrors.options =
        "All poll options are required.";
    }

    return newErrors;
  };

  const calculateStatus = (
    start,
    end
  ) => {
    const todayDate =
      new Date(today);

    const startDate =
      new Date(start);

    const endDate =
      new Date(end);

    if (todayDate < startDate)
      return "Upcoming";

    if (
      todayDate >=
      startDate &&
      todayDate <= endDate
    )
      return "Active";

    return "Closed";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation =
      validate();

    if (
      Object.keys(validation)
        .length
    ) {
      setErrors(validation);
      return;
    }

    const pollData = {
      ...form,
      status:
        calculateStatus(
          form.startDate,
          form.endDate
        ),
      updatedAt:
        new Date().toISOString(),
    };

    if (initialData) {
      updatePoll({
        ...initialData,
        ...pollData,
        options:
          pollData.options.map(
            (
              option,
              index
            ) => ({
              option:
                option.option,
              votes:
                initialData
                  .options?.[
                  index
                ]?.votes || 0,
            })
          ),
      });
    } else {
      addPoll({
        ...pollData,
        id: Date.now(),
        pollId: `POLL-${Date.now()}`,
        totalVotes: 0,
        createdAt:
          new Date().toISOString(),
        options:
          pollData.options.map(
            (item) => ({
              option:
                item.option,
              votes: 0,
            })
          ),
      });
    }

    onClose();
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Input label="Poll Question"
        value={form.question}
        error={errors.question}
        onChange={(e) = placeholder="Enter Poll Question..." >
          handleChange(
            "question",
            e.target.value
          )
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
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
            className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          >
            {categories.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>

        <Input label="Start Date"
          type="date"
          min={today}
          value={form.startDate}
          error={errors.startDate}
          onChange={(e) = placeholder="Enter Start Date..." >
            handleChange(
              "startDate",
              e.target.value
            )
          }
        />

        <Input label="End Date"
          type="date"
          min={form.startDate || today}
          value={form.endDate}
          error={errors.endDate}
          onChange={(e) = placeholder="Enter End Date..." >
            handleChange(
              "endDate",
              e.target.value
            )
          }
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Poll Options
          </label>

          <Button
            type="button"
            variant="outline"
            onClick={addOption}
          >
            + Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {form.options.map(
            (item, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1
                      }`}
                    value={item.option}
                    onChange={(e) =>
                      handleOptionChange(
                        index,
                        e.target.value
                      )
                    }
                  />
                </div>

                {form.options.length >
                  2 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() =>
                        removeOption(index)
                      }
                    >
                      Remove
                    </Button>
                  )}
              </div>
            )
          )}
        </div>

        {errors.options && (
          <p className="mt-2 text-sm text-red-600">
            {errors.options}
          </p>
        )}
      </div>

      {initialData && (
        <div className="grid gap-4 rounded-xl border bg-slate-50 p-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">
              Poll ID
            </p>
            <p className="font-semibold text-slate-800">
              {initialData.pollId}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Status
            </p>
            <p className="font-semibold text-indigo-600">
              {form.status}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Total Votes
            </p>
            <p className="font-semibold text-emerald-600">
              {initialData.totalVotes ?? 0}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button type="submit">
          {initialData
            ? "Update Poll"
            : "Create Poll"}
        </Button>
      </div>
    </form>
  );
};

export default PollForm;