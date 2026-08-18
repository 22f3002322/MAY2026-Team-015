import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";

import BookingStats from "../../components/bookings/BookingStats";
import BookingFilters from "../../components/bookings/BookingFilters";
import BookingTable from "../../components/bookings/BookingTable";
import BookingDetails from "../../components/bookings/BookingDetails";
import BookingFacilityChart from "../../components/bookings/BookingFacilityChart";
import BookingTrendChart from "../../components/bookings/BookingTrendChart";

import ConfirmDialog from "../../components/ui/ConfirmDialog";

import useBookingStore from "../../store/bookingStore";
import { BOOKING_STATUS, labelFor } from "../../utils/adminMaps";

const FacilityBookings = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const deleteBookingById = useBookingStore((state) => state.deleteBooking);
  const approveBooking = useBookingStore((state) => state.approveBooking);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);

  const mappedBookings = useMemo(() => {
    return bookings.map((b) => {
      const rawStatus = String(b.status || "booked").toLowerCase();
      return {
        id: b.booking_id || b.id,
        bookingId: `BK-${b.booking_id || b.id}`,
        facility: b.facility_name || b.facility || `Facility #${b.facility_id}`,
        resident: b.resident_name || b.resident || `Resident #${b.resident_id}`,
        flat: b.flat_number ? `Flat ${b.flat_number}` : b.flat || "—",
        date: b.booking_date || b.date,
        time:
          b.time_slot ||
          b.time ||
          `${String(b.start_time || "").slice(0, 5)} - ${String(b.end_time || "").slice(0, 5)}`,
        purpose: b.description || b.purpose || "Facility Reservation",
        status: rawStatus,
        statusLabel: labelFor(BOOKING_STATUS, rawStatus) || rawStatus,
        createdAt: b.created_at || b.createdAt,
      };
    });
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return mappedBookings.filter((booking) => {
      const q = search.toLowerCase();
      const matchesSearch =
        String(booking.resident || "").toLowerCase().includes(q) ||
        String(booking.flat || "").toLowerCase().includes(q) ||
        String(booking.facility || "").toLowerCase().includes(q) ||
        String(booking.bookingId || "").toLowerCase().includes(q);

      const matchesFacility = facility === "" || booking.facility === facility;
      const matchesStatus = status === "" || booking.status === status;
      const matchesDate = date === "" || booking.date === date;

      return matchesSearch && matchesFacility && matchesStatus && matchesDate;
    });
  }, [mappedBookings, search, facility, status, date]);

  const handleApprove = async (row) => {
    const res = await approveBooking(row.id);
    if (res.success) toast.success("Booking approved.");
    else toast.error(res.message || "Approve failed.");
  };

  const handleCancel = async () => {
    if (!cancelBooking) return;
    const res = await deleteBookingById(cancelBooking.id);
    if (res.success) {
      toast.success("Booking cancelled.");
      setCancelBooking(null);
    } else {
      toast.error(res.message || "Cancel failed.");
    }
  };

  return (
    <Layout title="Facility Booking Management" breadcrumb={["Home", "Facility Booking"]}>
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
        onApprove={handleApprove}
        onDelete={setCancelBooking}
      />

      <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} />

      <ConfirmDialog
        open={!!cancelBooking}
        title="Cancel Reservation"
        message={`Cancel booking ${cancelBooking?.bookingId}?`}
        confirmText="Cancel Booking"
        onCancel={() => setCancelBooking(null)}
        onConfirm={handleCancel}
      />
    </Layout>
  );
};

export default FacilityBookings;
