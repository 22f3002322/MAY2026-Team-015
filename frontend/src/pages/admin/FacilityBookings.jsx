import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";

import BookingStats from "../../components/bookings/BookingStats";
import BookingFilters from "../../components/bookings/BookingFilters";
import BookingTable from "../../components/bookings/BookingTable";
import BookingDetails from "../../components/bookings/BookingDetails";
import BookingFacilityChart from "../../components/bookings/BookingFacilityChart";
import BookingTrendChart from "../../components/bookings/BookingTrendChart";

import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useBookingStore from "../../store/bookingStore";

const FacilityBookings = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const deleteBookingById = useBookingStore((state) => state.deleteBooking);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filters
  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteBooking, setDeleteBooking] = useState(null);

  const mappedBookings = useMemo(() => {
    return bookings.map((b) => ({
      id: b.booking_id || b.id,
      bookingId: `BK-${b.booking_id || b.id}`,
      facility: b.facility_name || b.facility || `Facility #${b.facility_id}`,
      resident: b.resident_name || b.resident || `Resident #${b.resident_id}`,
      flat: b.flat_number ? `Flat ${b.flat_number}` : (b.flat || "—"),
      date: b.booking_date || b.date,
      time: b.time_slot || b.time || `${b.start_time?.slice(0, 5)} - ${b.end_time?.slice(0, 5)}`,
      purpose: b.description || b.purpose || "Facility Reservation",
      status: b.status || "Pending",
      createdAt: b.created_at || b.createdAt,
    }));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return mappedBookings.filter((booking) => {
      const matchesSearch =
        (booking.resident || "").toLowerCase().includes(search.toLowerCase()) ||
        (booking.flat || "").toLowerCase().includes(search.toLowerCase()) ||
        (booking.facility || "").toLowerCase().includes(search.toLowerCase()) ||
        (booking.bookingId || "").toLowerCase().includes(search.toLowerCase());

      const matchesFacility =
        facility === "" || booking.facility === facility;

      const matchesStatus =
        status === "" || booking.status === status;

      const matchesDate =
        date === "" ||
        booking.date ===
          new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

      return matchesSearch && matchesFacility && matchesStatus && matchesDate;
    });
  }, [mappedBookings, search, facility, status, date]);

  return (
    <Layout
      title="Facility Booking Management"
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
      />

      <BookingTable
        bookings={filteredBookings}
        onView={setSelectedBooking}
        onDelete={setDeleteBooking}
      />

      <BookingDetails
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />

      <ConfirmDialog
        open={!!deleteBooking}
        title="Cancel Reservation"
        message={`Are you sure you want to cancel booking ${deleteBooking?.bookingId}?`}
        confirmText="Cancel Booking"
        onCancel={() => setDeleteBooking(null)}
        onConfirm={() => {
          deleteBookingById(deleteBooking.id);
          setDeleteBooking(null);
          toast.success("Booking cancelled.");
        }}
      />
    </Layout>
  );
};

export default FacilityBookings;