import { useState } from "react";

import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

const PaymentModal = ({
  open,
  bill,
  onClose,
  onPay,
}) => {
  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  if (!bill) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onPay(paymentMethod);

    setPaymentMethod("UPI");
  };

  return (
    <Modal
      open={open}
      title="Pay Bill"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Bill Information */}

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5">
          <div className="flex justify-between mb-3">
            <span className="text-slate-500 dark:text-slate-400">
              Bill ID
            </span>

            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {bill.billId}
            </span>
          </div>

          <div className="flex justify-between mb-3">
            <span className="text-slate-500 dark:text-slate-400">
              Category
            </span>

            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {bill.category}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              Amount
            </span>

            <span className="text-lg font-bold text-indigo-600">
              ₹
              {Number(
                bill.amount
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value
              )
            }
            className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="UPI">
              UPI
            </option>

            <option value="Credit Card">
              Credit Card
            </option>

            <option value="Debit Card">
              Debit Card
            </option>

            <option value="Net Banking">
              Net Banking
            </option>

            <option value="Cash">
              Cash
            </option>
          </select>
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            Pay ₹
            {Number(
              bill.amount
            ).toLocaleString()}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;