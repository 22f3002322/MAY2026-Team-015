import { useState } from "react";

import Layout from "../../components/layout/Layout";
import ResidentFilters from "../../components/residents/ResidentFilters";
import ResidentTable from "../../components/residents/ResidentTable";
import ResidentForm from "../../components/residents/ResidentForm";
import Modal from "../../components/ui/Modal";
import ResidentDetails from "../../components/residents/ResidentDetails";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ResidentStats from "../../components/residents/ResidentStats";
import Pagination from "../../components/ui/Pagination";

import { residents } from "../../mock/residents";

const Residents = () => {
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);
  const [deleteResident, setDeleteResident] = useState(null);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.name.toLowerCase().includes(search.toLowerCase()) ||
      resident.flat.toLowerCase().includes(search.toLowerCase()) ||
      resident.phone.includes(search);

    const matchesBlock =
      block === "" || resident.block === block;

    const matchesOccupancy =
      occupancy === "" ||
      resident.occupancy === occupancy;

    return (
      matchesSearch &&
      matchesBlock &&
      matchesOccupancy
    );
  });

  return (
    <Layout
      title="Residents"
      breadcrumb={["Home", "Residents"]}
    >
      <ResidentStats />

      <ResidentFilters
        search={search}
        setSearch={setSearch}
        block={block}
        setBlock={setBlock}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        onAddResident={() => setOpenModal(true)}
      />

      <ResidentTable
        residents={filteredResidents}
        onView={setSelectedResident}
        onEdit={(resident) => {
        setEditingResident(resident);
        setEditModal(true);
        }}
        onDelete={setDeleteResident}
      />
      <Pagination />

      <Modal
        open={openModal}
        title="Add Resident"
        onClose={() => setOpenModal(false)}
      >
        <ResidentForm
          onClose={() => setOpenModal(false)}
        />
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
          title="Delete Resident"
          message={`Are you sure you want to delete ${deleteResident?.name}?`}
          confirmText="Delete"
          onCancel={() => setDeleteResident(null)}
          onConfirm={() => {
          console.log("Delete:", deleteResident);
          setDeleteResident(null);
  }}
/>
    </Layout>
  );
};

export default Residents;