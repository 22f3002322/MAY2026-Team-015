import { useState } from "react";

import Layout from "../../components/layout/Layout";

import BookingStats from "../../components/bookings/BookingStats";
import BookingFilters from "../../components/bookings/BookingFilters";
import BookingTable from "../../components/bookings/BookingTable";
import BookingForm from "../../components/bookings/BookingForm";
import BookingDetails from "../../components/bookings/BookingDetails";
import BookingFacilityChart from "../../components/bookings/BookingFacilityChart";
import BookingTrendChart from "../../components/bookings/BookingTrendChart";

import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import { bookings } from "../../mock/bookings";

const FacilityBookings = () => {
  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState(null);
  const [editingBooking, setEditingBooking] =
    useState(null);
  const [deleteBooking, setDeleteBooking] =
    useState(null);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.resident
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.flat
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      booking.facility
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFacility =
      facility === "" ||
      booking.facility === facility;

    const matchesStatus =
      status === "" ||
      booking.status === status;

    const matchesDate =
      date === "" ||
      booking.date ===
      new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    return (
      matchesSearch &&
      matchesFacility &&
      matchesStatus &&
      matchesDate
    );
  });

  return (
    <Layout
      title="Facility Booking"
      breadcrumb={["Home", "Facility Booking"]}
    >
      <BookingStats />
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
  <BookingFacilityChart />
  <BookingTrendChart />
</div>

      <BookingFilters
        search={search}
        setSearch={setSearch}
        facility={facility}
        setFacility={setFacility}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
        onAddBooking={() => {
          setEditingBooking(null);
          setOpenModal(true);
        }}
      />

      <BookingTable
        bookings={filteredBookings}
        onView={setSelectedBooking}
        onEdit={(booking) => {
          setEditingBooking(booking);
          setOpenModal(true);
        }}
        onDelete={setDeleteBooking}
      />
      <Modal
        open={openModal}
        title={
          editingBooking
            ? "Edit Booking"
            : "New Booking"
        }
        onClose={() => {
          setOpenModal(false);
          setEditingBooking(null);
        }}
      >
        <BookingForm
          initialData={editingBooking}
          onClose={() => {
            setOpenModal(false);
            setEditingBooking(null);
          }}
        />
      </Modal>
      <BookingDetails
        booking={selectedBooking}
        onClose={() =>
          setSelectedBooking(null)
        }
      />
      <ConfirmDialog
        open={!!deleteBooking}
        title="Delete Booking"
        message={`Delete booking ${deleteBooking?.bookingId}?`}
        confirmText="Delete"
        onCancel={() =>
          setDeleteBooking(null)
        }
        onConfirm={() => {
          console.log(deleteBooking);

          setDeleteBooking(null);
        }}
      />
    </Layout>
  );
};

export default FacilityBookings;