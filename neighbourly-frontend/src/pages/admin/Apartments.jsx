import { useState } from "react";

import Layout from "../../components/layout/Layout";
import ApartmentStats from "../../components/apartments/ApartmentStat";
import ApartmentFilters from "../../components/apartments/ApartmentFilters";
import ApartmentTable from "../../components/apartments/ApartmentTable";
import ApartmentDetails from "../../components/apartments/ApartmentDetails";
import ApartmentForm from "../../components/apartments/ApartmentForm";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useApartmentStore from "../../store/apartmentStore";

const Apartments = () => {
  // Zustand Store

  const apartments = useApartmentStore(
    (state) => state.apartments
  );

  const addApartment = useApartmentStore(
    (state) => state.addApartment
  );

  const updateApartment = useApartmentStore(
    (state) => state.updateApartment
  );

  const removeApartment = useApartmentStore(
    (state) => state.deleteApartment
  );

  // Filters

  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");

  // Modals

  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  // Selected Data

  const [selectedApartment, setSelectedApartment] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);
  const [deleteApartment, setDeleteApartment] = useState(null);

  // Filter

  const query = search.toLowerCase();

  const filteredApartments = apartments.filter((flat) => {
    const matchesSearch =
      String(flat?.flat ?? "")
        .toLowerCase()
        .includes(query) ||
      String(flat?.owner ?? "")
        .toLowerCase()
        .includes(query);

    const matchesBlock =
      block === "" || flat?.block === block;

    const matchesOccupancy =
      occupancy === "" ||
      flat?.occupancy === occupancy;

    return (
      matchesSearch &&
      matchesBlock &&
      matchesOccupancy
    );
  });

  return (
    <Layout
      title="Apartments"
      breadcrumb={["Home", "Apartments"]}
    >
      <ApartmentStats />

      <ApartmentFilters
        search={search}
        setSearch={setSearch}
        block={block}
        setBlock={setBlock}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        onAddApartment={() => setOpenModal(true)}
      />

      <ApartmentTable
        apartments={filteredApartments}
        onView={setSelectedApartment}
        onEdit={(flat) => {
          setEditingApartment(flat);
          setEditModal(true);
        }}
        onDelete={setDeleteApartment}
      />

      {/* Add Apartment */}

      <Modal
        open={openModal}
        title="Add Apartment"
        onClose={() => setOpenModal(false)}
      >
        <ApartmentForm
          onSubmit={(data) => {
            addApartment({
              ...data,
              id: Date.now(),
            });

            setOpenModal(false);
          }}
          onClose={() => setOpenModal(false)}
        />
      </Modal>

      {/* Edit Apartment */}

      <Modal
        open={editModal}
        title="Edit Apartment"
        onClose={() => {
          setEditModal(false);
          setEditingApartment(null);
        }}
      >
        <ApartmentForm
          initialData={editingApartment}
          onSubmit={(data) => {
            updateApartment(
              editingApartment.id,
              data
            );

            setEditModal(false);
            setEditingApartment(null);
          }}
          onClose={() => {
            setEditModal(false);
            setEditingApartment(null);
          }}
        />
      </Modal>

      {/* View Details */}

      <ApartmentDetails
        apartment={selectedApartment}
        onClose={() =>
          setSelectedApartment(null)
        }
      />

      {/* Delete */}

      <ConfirmDialog
        open={!!deleteApartment}
        title="Delete Apartment"
        message={`Are you sure you want to delete ${deleteApartment?.flat}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteApartment(null)
        }
        onConfirm={() => {
          removeApartment(deleteApartment.id);

          setDeleteApartment(null);
        }}
      />
    </Layout>
  );
};

export default Apartments;