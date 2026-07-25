import { useState } from "react";

import Layout from "../../components/layout/Layout";

import StaffStats from "../../components/staff/StaffStats";
import StaffFilters from "../../components/staff/StaffFilters";
import StaffTable from "../../components/staff/StaffTable";
import StaffForm from "../../components/staff/StaffForm";
import StaffDetails from "../../components/staff/StaffDetails";
import StaffDepartmentChart from "../../components/staff/StaffDepartmentChart";
import StaffAttendanceChart from "../../components/staff/StaffAttendanceChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useStaffStore from "../../store/staffStore";

const Staff = () => {
  // Zustand

  const staff = useStaffStore(
    (state) => state.staff
  );

  const addStaff = useStaffStore(
    (state) => state.addStaff
  );

  const updateStaff = useStaffStore(
    (state) => state.updateStaff
  );

  const deleteStaff = useStaffStore(
    (state) => state.deleteStaff
  );

  // Filters

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  // Modals

  const [openModal, setOpenModal] = useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [editingStaff, setEditingStaff] =
    useState(null);

  const [deleteEmployee, setDeleteEmployee] =
    useState(null);

  const filteredStaff = staff.filter((employee) => {
    const matchesSearch =
      employee.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      employee.employeeId
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      employee.phone.includes(search);

    const matchesDepartment =
      department === "" ||
      employee.department === department;

    const matchesStatus =
      status === "" ||
      employee.status === status;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus
    );
  });

  return (
    <Layout
      title="Staff Management"
      breadcrumb={["Home", "Staff"]}
    >
      <StaffStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <StaffDepartmentChart />
        <StaffAttendanceChart />
      </div>

      <StaffFilters
        search={search}
        setSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        onAddStaff={() => {
          setEditingStaff(null);
          setOpenModal(true);
        }}
      />

      <StaffTable
        staff={filteredStaff}
        onView={setSelectedStaff}
        onEdit={(employee) => {
          setEditingStaff(employee);
          setOpenModal(true);
        }}
        onDelete={setDeleteEmployee}
      />

      {/* Add / Edit */}

      <Modal
        open={openModal}
        title={
          editingStaff
            ? "Edit Staff"
            : "Add Staff"
        }
        onClose={() => {
          setOpenModal(false);
          setEditingStaff(null);
        }}
      >
        <StaffForm
          initialData={editingStaff}
          onSubmit={(data) => {
            if (editingStaff) {
              updateStaff(
                editingStaff.id,
                data
              );
            } else {
              addStaff({
                ...data,
                id: Date.now(),
                employeeId: `EMP-${Date.now()
                  .toString()
                  .slice(-4)}`,
                createdAt:
                  new Date().toISOString(),
              });
            }

            setOpenModal(false);
            setEditingStaff(null);
          }}
          onClose={() => {
            setOpenModal(false);
            setEditingStaff(null);
          }}
        />
      </Modal>

      {/* Details */}

      <StaffDetails
        staff={selectedStaff}
        onClose={() =>
          setSelectedStaff(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteEmployee}
        title="Delete Staff"
        message={`Delete ${deleteEmployee?.name}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteEmployee(null)
        }
        onConfirm={() => {
          deleteStaff(deleteEmployee.id);

          setDeleteEmployee(null);
        }}
      />
    </Layout>
  );
};

export default Staff;