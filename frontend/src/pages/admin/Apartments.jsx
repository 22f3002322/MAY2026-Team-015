import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";
import ApartmentStats from "../../components/apartments/ApartmentStat";
import ApartmentFilters from "../../components/apartments/ApartmentFilters";
import ApartmentTable from "../../components/apartments/ApartmentTable";
import ApartmentDetails from "../../components/apartments/ApartmentDetails";
import ApartmentForm from "../../components/apartments/ApartmentForm";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useApartmentStore from "../../store/apartmentStore";
import useAuthStore from "../../store/authStore";

// Step 2: mapFlatToRow now accepts an ownersByFlatId lookup and fills `owner`
const mapFlatToRow = (flat, blocks, ownersByFlatId = {}) => {
  const block = blocks.find((b) => b.block_id === flat.block_id);
  const owners = ownersByFlatId[flat.flat_id];
  return {
    id: flat.flat_id,
    flat_id: flat.flat_id,
    flat: flat.flat_number,
    block: block?.block_name || flat.block_name || `Block ${flat.block_id}`,
    block_id: flat.block_id,
    floor: flat.floor_number,
    type: flat.flat_type,
    owner: owners?.length ? owners.join(", ") : "—",
    occupancy: flat.occupancy_status === "occupied" ? "Occupied" : "Vacant",
    raw: flat,
  };
};

const Apartments = () => {
  const { backendRole } = useAuthStore();
  const isPureAdmin = String(backendRole || "").toLowerCase() === "admin";
  const canSeeResidents = ["admin", "committee"].includes(
    String(backendRole || "").toLowerCase()
  );

  const flats = useApartmentStore((state) => state.flats);
  const blocks = useApartmentStore((state) => state.blocks);
  const residents = useApartmentStore((state) => state.residents);
  const fetchFlats = useApartmentStore((state) => state.fetchFlats);
  const fetchBlocks = useApartmentStore((state) => state.fetchBlocks);
  const fetchResidents = useApartmentStore((state) => state.fetchResidents);
  const createFlat = useApartmentStore((state) => state.createFlat);
  const updateFlat = useApartmentStore((state) => state.updateFlat);
  const deleteFlat = useApartmentStore((state) => state.deleteFlat);

  useEffect(() => {
    fetchBlocks();
    fetchFlats();
    if (canSeeResidents) fetchResidents();
  }, [fetchBlocks, fetchFlats, fetchResidents, canSeeResidents]);

  // Step 3: build flat_id -> [owner names] map from the residents directory
  const ownersByFlatId = useMemo(() => {
    const map = {};
    (residents || []).forEach((r) => {
      if (!r.flat_id) return;
      (map[r.flat_id] ||= []).push(r.full_name);
    });
    return map;
  }, [residents]);

  const apartments = useMemo(
    () => flats.map((f) => mapFlatToRow(f, blocks, ownersByFlatId)),
    [flats, blocks, ownersByFlatId]
  );

  const [search, setSearch] = useState("");
  const [block, setBlock] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);
  const [deleteApartment, setDeleteApartment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const query = search.toLowerCase();
  const filteredApartments = apartments.filter((flat) => {
    const matchesSearch =
      String(flat?.flat ?? "").toLowerCase().includes(query) ||
      String(flat?.block ?? "").toLowerCase().includes(query);
    const matchesBlock = block === "" || flat?.block === block;
    const matchesOccupancy = occupancy === "" || flat?.occupancy === occupancy;
    return matchesSearch && matchesBlock && matchesOccupancy;
  });

  const handleCreate = async (data) => {
    const res = await createFlat({
      block_id: data.block_id,
      flat_number: data.flat,
      floor_number: data.floor,
      flat_type: (data.type || "2BHK").replace(/\s+/g, ""),
    });
    if (res.success) {
      toast.success("Flat created.");
      setOpenModal(false);
    } else {
      toast.error(res.message || "Failed to create flat.");
    }
  };

  const handleUpdate = async (data) => {
    const res = await updateFlat(editingApartment.flat_id, {
      flat_number: data.flat,
      floor_number: Number(data.floor) || undefined,
      flat_type: (data.type || "2BHK").replace(/\s+/g, ""),
    });
    if (res.success) {
      toast.success("Flat updated.");
      setEditModal(false);
      setEditingApartment(null);
    } else {
      toast.error(res.message || "Failed to update flat.");
    }
  };

  const handleDelete = async () => {
    if (!deleteApartment) return;
    setDeleting(true);
    const res = await deleteFlat(deleteApartment.flat_id);
    setDeleting(false);
    if (res.success) {
      toast.success("Flat deleted.");
      setDeleteApartment(null);
    } else {
      toast.error(res.message || "Failed to delete flat.");
    }
  };

  return (
    <Layout title="Apartments" breadcrumb={["Home", "Apartments"]}>
      <ApartmentStats />

      <ApartmentFilters
        search={search}
        setSearch={setSearch}
        block={block}
        setBlock={setBlock}
        occupancy={occupancy}
        setOccupancy={setOccupancy}
        onAddApartment={isPureAdmin ? () => setOpenModal(true) : undefined}
      />

      <ApartmentTable
        apartments={filteredApartments}
        onView={setSelectedApartment}
        onEdit={(flat) => {
          setEditingApartment(flat);
          setEditModal(true);
        }}
        onDelete={isPureAdmin ? setDeleteApartment : undefined}
      />

      <Modal open={openModal} title="Add Flat" onClose={() => setOpenModal(false)}>
        <ApartmentForm onSubmit={handleCreate} onClose={() => setOpenModal(false)} />
      </Modal>

      <Modal
        open={editModal}
        title="Edit Flat"
        onClose={() => {
          setEditModal(false);
          setEditingApartment(null);
        }}
      >
        <ApartmentForm
          isEdit
          initialData={
            editingApartment
              ? {
                  flat: editingApartment.flat,
                  block_id: String(editingApartment.block_id || ""),
                  floor: editingApartment.floor,
                  type: String(editingApartment.type || "2BHK").replace(/\s+/g, ""),
                }
              : null
          }
          onSubmit={handleUpdate}
          onClose={() => {
            setEditModal(false);
            setEditingApartment(null);
          }}
        />
      </Modal>

      <Modal
        open={!!selectedApartment}
        title="Flat Details"
        onClose={() => setSelectedApartment(null)}
      >
        {selectedApartment && (
          <ApartmentDetails
            apartment={selectedApartment}
            onClose={() => setSelectedApartment(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteApartment}
        title="Delete Flat"
        message={`Delete flat ${deleteApartment?.flat} in ${deleteApartment?.block}? Only vacant flats can be deleted.`}
        confirmText={deleting ? "Deleting…" : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setDeleteApartment(null)}
      />
    </Layout>
  );
};

export default Apartments;