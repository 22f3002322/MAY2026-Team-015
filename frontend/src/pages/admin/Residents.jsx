import { useState } from "react";

import Layout from "../../components/layout/Layout";

import ResidentFilters from "../../components/residents/ResidentFilters";
import ResidentTable from "../../components/residents/ResidentTable";
import ResidentForm from "../../components/residents/ResidentForm";
import ResidentDetails from "../../components/residents/ResidentDetails";
import ResidentStats from "../../components/residents/ResidentStats";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Pagination from "../../components/ui/Pagination";

import useResidentStore from "../../store/residentStore";

const Residents = () => {
  // Zustand

  const residents = useResidentStore(
    (state) => state.residents
  );

  const addResident = useResidentStore(
    (state) => state.addResident
  );

  const updateResident = useResidentStore(
    (state) => state.updateResident
  );

  const removeResident = useResidentStore(
    (state) => state.deleteResident
  );

  // Filters

  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");

  // Details

  const [selectedResident, setSelectedResident] =
    useState(null);

  // Delete

  const [deleteResident, setDeleteResident] =
    useState(null);

  // Add

  const [openModal, setOpenModal] =
    useState(false);

  // Edit

  const [editingResident, setEditingResident] =
    useState(null);

  const [editModal, setEditModal] =
    useState(false);

  // Filter

  const filteredResidents =
    residents.filter((resident) => {
      const matchesSearch =
        resident.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resident.flat
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resident.phone.includes(search);

      const matchesBlock =
        block === "" ||
        resident.block === block;

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
        onAddResident={() =>
          setOpenModal(true)
        }
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

      {/* Add */}

      <Modal
        open={openModal}
        title="Add Resident"
        onClose={() =>
          setOpenModal(false)
        }
      >
        <ResidentForm
          onSubmit={(data) => {
            addResident({
              ...data,
              id: Date.now(),
            });

            setOpenModal(false);
          }}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Modal>

      {/* Edit */}

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
          onSubmit={(data) => {
            updateResident(
              editingResident.id,
              data
            );

            setEditModal(false);
            setEditingResident(null);
          }}
          onClose={() => {
            setEditModal(false);
            setEditingResident(null);
          }}
        />
      </Modal>

      {/* Details */}

      <ResidentDetails
        resident={selectedResident}
        onClose={() =>
          setSelectedResident(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteResident}
        title="Delete Resident"
        message={`Are you sure you want to delete ${deleteResident?.name}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteResident(null)
        }
        onConfirm={() => {
          removeResident(deleteResident.id);

          setDeleteResident(null);
        }}
      />
    </Layout>
  );
};

export default Residents;