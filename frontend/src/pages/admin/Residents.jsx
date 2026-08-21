import { useState, useEffect } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";

import ResidentFilters from "../../components/residents/ResidentFilters";
import ResidentTable from "../../components/residents/ResidentTable";
import ResidentForm from "../../components/residents/ResidentForm";
import ResidentDetails from "../../components/residents/ResidentDetails";
import ResidentStats from "../../components/residents/ResidentStats";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useResidentStore from "../../store/residentStore";
import useAuthStore from "../../store/authStore";
import PendingVerifications from "../../components/admin/PendingVerifications";

const Residents = () => {
  const { backendRole } = useAuthStore();
  const isCommittee = String(backendRole || "").toLowerCase() === "committee";
  const isAdmin = String(backendRole || "").toLowerCase() === "admin";

  const residents = useResidentStore((state) => state.residents);
  const addResident = useResidentStore((state) => state.addResident);
  const updateResident = useResidentStore((state) => state.updateResident);
  const removeResident = useResidentStore((state) => state.deleteResident);
  const toggleResidentActive = useResidentStore((state) => state.toggleResidentActive);
  const fetchResidents = useResidentStore((state) => state.fetchResidents);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [deleteResident, setDeleteResident] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const filteredResidents = residents.filter((resident) => {
    const q = search.toLowerCase();
    const matchesSearch =
      String(resident.name || "").toLowerCase().includes(q) ||
      String(resident.flat || "").toLowerCase().includes(q) ||
      String(resident.phone || "").includes(search);

    const matchesBlock = block === "" || resident.block === block;
    const matchesOccupancy = occupancy === "" || resident.occupancy === occupancy;

    return matchesSearch && matchesBlock && matchesOccupancy;
  });

  const handleAdd = async (data) => {
    const res = await addResident(data);
    if (res.success) {
      toast.success(res.message || "Resident added.");
      setOpenModal(false);
    } else {
      toast.error(res.message || "Failed to add resident.");
    }
  };

  const handleEdit = async (data) => {
    const res = await updateResident(editingResident.id, data);
    if (res.success) {
      toast.success("Resident updated.");
      setEditModal(false);
      setEditingResident(null);
    } else {
      toast.error(res.message || "Failed to update resident.");
    }
  };

  const handleMoveOut = async () => {
    if (!deleteResident) return;
    const res = await removeResident(deleteResident.id);
    if (res.success) {
      toast.success("Resident moved out.");
      setDeleteResident(null);
    } else {
      toast.error(res.message || "Move-out failed.");
    }
  };

  const handleToggleActive = async (resident) => {
    const res = await toggleResidentActive(resident);
    if (res.success) {
      toast.success(
        resident.isActive ? "Resident account deactivated." : "Resident account activated."
      );
    } else {
      toast.error(res.message || "Failed to update account status.");
    }
  };

  return (
    <Layout title="Residents" breadcrumb={["Home", "Residents"]}>
      <PendingVerifications />

      <ResidentStats />

      <ResidentFilters
        search={search}
        setSearch={setSearch}
        block={block}
        setBlock={setBlock}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        onAddResident={isCommittee ? () => setOpenModal(true) : undefined}
      />

      <ResidentTable
        residents={filteredResidents}
        onView={setSelectedResident}
        onEdit={(resident) => {
          setEditingResident(resident);
          setEditModal(true);
        }}
        onDelete={setDeleteResident}
        onToggleStatus={isAdmin ? handleToggleActive : undefined}
      />

      <Modal open={openModal} title="Add Resident" onClose={() => setOpenModal(false)}>
        <ResidentForm onSubmit={handleAdd} onClose={() => setOpenModal(false)} />
      </Modal>

      <Modal
        open={editModal}
        title="Edit Resident"
        onClose={() => {
          setEditModal(false);
          setEditingResident(null);
        }}
      >
        <ResidentForm
          initialData={editingResident}
          onSubmit={handleEdit}
          onClose={() => {
            setEditModal(false);
            setEditingResident(null);
          }}
        />
      </Modal>

      <ResidentDetails
        resident={selectedResident}
        onClose={() => setSelectedResident(null)}
      />

      <ConfirmDialog
        open={!!deleteResident}
        title="Move Out Resident"
        message={`Move out ${deleteResident?.name}? They will leave their current flat.`}
        confirmText="Move Out"
        onCancel={() => setDeleteResident(null)}
        onConfirm={handleMoveOut}
      />
    </Layout>
  );
};

export default Residents;