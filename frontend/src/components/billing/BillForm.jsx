import { useEffect, useState } from "react";
import { toast } from "sonner";

import Input from "../ui/Input";
import Button from "../ui/Button";

import useBillingStore from "../../store/billingStore";
import useApartmentStore from "../../store/apartmentStore";

const BillForm = ({ initialData = null, onClose }) => {
  const createBill = useBillingStore((state) => state.createBill);
  const updateBill = useBillingStore((state) => state.updateBill);

  const flats = useApartmentStore((state) => state.flats);
  const fetchFlats = useApartmentStore((state) => state.fetchFlats);

  useEffect(() => {
    fetchFlats();
  }, [fetchFlats]);

  const today = new Date().toISOString().split("T")[0];
  const defaultMonth = today.slice(0, 7);

  const [form, setForm] = useState(
    initialData
      ? {
          flat_id: String(initialData.flat_id || ""),
          billing_month: initialData.billing_month || defaultMonth,
          due_date: (initialData.due_date || today).toString().slice(0, 10),
          amount: String(initialData.amount || ""),
          description: initialData.description || "Maintenance charges",
          status:
            String(initialData.statusValue || initialData.status || "unpaid")
              .toLowerCase() === "paid"
              ? "paid"
              : "unpaid",
        }
      : {
          flat_id: "",
          billing_month: defaultMonth,
          due_date: today,
          amount: "",
          description: "Maintenance charges",
          status: "unpaid",
        }
  );

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    const next = {};

    // Required for both create and update
    if (!form.flat_id) {
      next.flat_id = "Flat is required.";
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(form.billing_month)) {
      next.billing_month = "Use YYYY-MM format.";
    }

    if (!form.due_date) {
      next.due_date = "Due date is required.";
    }

    // Amount is required only when creating a bill.
    // During update, the amount field is hidden.
    if (!initialData && (!form.amount || Number(form.amount) <= 0)) {
      next.amount = "Amount must be greater than 0.";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);

    try {
      // =========================
      // UPDATE EXISTING BILL
      // =========================
      if (initialData?.bill_id || initialData?.id) {
        const billId = initialData.bill_id || initialData.id;

        const res = await updateBill(billId, {
          due_date: form.due_date,
          status:
            form.status?.toLowerCase() === "paid"
              ? "paid"
              : "unpaid",
        });

        if (res?.success) {
          toast.success(res.message || "Bill updated successfully.");
          onClose();
        } else {
          toast.error(res?.message || "Failed to update bill.");
        }

        return;
      }

      // =========================
      // CREATE NEW BILL
      // =========================
      const amount = Number(form.amount);

      const res = await createBill({
        flat_id: Number(form.flat_id),
        billing_month: form.billing_month,
        due_date: form.due_date,
        amount,
        items: [
          {
            description:
              form.description?.trim() || "Maintenance charges",
            amount,
          },
        ],
      });

      if (res?.success) {
        toast.success(res.message || "Bill created successfully.");
        onClose();
      } else {
        toast.error(res?.message || "Failed to create bill.");
      }
    } catch (error) {
      console.error("Bill form submission error:", error);

      toast.error(
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Flat */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Flat
        </label>

        <select
          value={form.flat_id}
          disabled={Boolean(initialData)}
          onChange={(e) =>
            handleChange("flat_id", e.target.value)
          }
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">Select flat</option>

          {flats.map((f) => (
            <option key={f.flat_id} value={f.flat_id}>
              {f.block_name ? `${f.block_name} - ` : ""}
              {f.flat_number} (#{f.flat_id})
            </option>
          ))}
        </select>

        {errors.flat_id && (
          <p className="mt-1 text-sm text-red-600">
            {errors.flat_id}
          </p>
        )}
      </div>

      {/* Billing Month + Due Date */}
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Billing Month (YYYY-MM)"
          value={form.billing_month}
          disabled={Boolean(initialData)}
          error={errors.billing_month}
          onChange={(e) =>
            handleChange("billing_month", e.target.value)
          }
        />

        <Input
          label="Due Date"
          type="date"
          value={form.due_date}
          error={errors.due_date}
          onChange={(e) =>
            handleChange("due_date", e.target.value)
          }
        />
      </div>

      {/* Create-only fields */}
      {!initialData && (
        <>
          <Input
            label="Amount (INR)"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            error={errors.amount}
            onChange={(e) =>
              handleChange("amount", e.target.value)
            }
          />

          <Input
            label="Line item description"
            value={form.description}
            onChange={(e) =>
              handleChange("description", e.target.value)
            }
          />
        </>
      )}

      {/* Update-only status */}
      {initialData && (
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              handleChange("status", e.target.value)
            }
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="flex-1"
          loading={loading}
        >
          {initialData ? "Update Bill" : "Create Bill"}
        </Button>
      </div>
    </form>
  );
};

export default BillForm;
