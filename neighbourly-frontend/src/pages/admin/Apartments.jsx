import { useState } from "react";

import Layout from "../../components/layout/Layout";
import ApartmentStats from "../../components/apartments/ApartmentStat";
import ApartmentFilters from "../../components/apartments/ApartmentFilters";
import ApartmentTable from "../../components/apartments/ApartmentTable";
import ApartmentDetails from "../../components/apartments/ApartmentDetails";
import Modal from "../../components/ui/Modal";
import ApartmentForm from "../../components/apartments/ApartmentForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { apartments } from "../../mock/apartments";

const Apartments = () => {
  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const [selectedApartment, setSelectedApartment] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteApartment, setDeleteApartment] = useState(null);

  const filteredApartments = apartments.filter((flat) => {
    const matchesSearch =
      flat.flat.toLowerCase().includes(search.toLowerCase()) ||
      flat.owner.toLowerCase().includes(search.toLowerCase());

    const matchesBlock =
      block === "" || flat.block === block;

    const matchesOccupancy =
      occupancy === "" ||
      flat.occupancy === occupancy;

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
      <Modal
        open={openModal}
        title="Add Apartment"
        onClose={() => setOpenModal(false)}
        >
        <ApartmentForm
            onClose={() => setOpenModal(false)}
        />
    </Modal>
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
            onClose={() => {
            setEditModal(false);
            setEditingApartment(null);
            }}
        />
    </Modal>
    <ApartmentDetails
    apartment={selectedApartment}
    onClose={() => setSelectedApartment(null)}
    />
    <ConfirmDialog
        open={!!deleteApartment}
        title="Delete Apartment"
        message={`Are you sure you want to delete ${deleteApartment?.flat}?`}
        confirmText="Delete"
        onCancel={() => setDeleteApartment(null)}
        onConfirm={() => {
            console.log(deleteApartment);

            setDeleteApartment(null);
        }}
    />
    </Layout>
  );
};

export default Apartments;