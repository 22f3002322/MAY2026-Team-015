import { useMemo, useState, useEffect } from "react";
import useBookingStore from "../../store/bookingStore";

import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";

import FacilityStats from "../../components/residents/facilities/FacilittyStats";
import FacilityFilters from "../../components/residents/facilities/FacilityFilters";
import FacilityCard from "../../components/residents/facilities/FacilityCard";
import FacilityBookingForm from "../../components/residents/facilities/FacilityBookingForm";
import BookingHistory from "../../components/residents/facilities/BookingHistory";
import BookingDetails from "../../components/residents/facilities/BookingDetails";

import useFacilityStore from "../../store/facilityStore";

const Facilities = () => {
  const facilities = useFacilityStore(
    (state) => state.facilities
  );

  const bookings = useFacilityStore(
    (state) => state.bookings
  );

  const fetchFacilities = useFacilityStore((state) => state.fetchFacilities);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);

  useEffect(() => {
    fetchFacilities();
    fetchBookings();
  }, [fetchFacilities, fetchBookings]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [
    selectedFacility,
    setSelectedFacility,
  ] = useState(null);

  const [
    selectedBooking,
    setSelectedBooking,
  ] = useState(null);

  const filteredFacilities =
    useMemo(() => {
      let data = [...facilities];

      if (search.trim()) {
        const query =
          search.toLowerCase();

        data = data.filter(
          (facility) =>
            facility.name
              .toLowerCase()
              .includes(query) ||
            facility.category
              .toLowerCase()
              .includes(query) ||
            facility.location
              .toLowerCase()
              .includes(query)
        );
      }

      data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      return data;
    }, [facilities, search]);

  const filteredBookings =
    useMemo(() => {
      let data = [...bookings];

      if (status) {
        data = data.filter(
          (booking) =>
            booking.status === status
        );
      }

      data.sort((a, b) => {
        const dateA = new Date(
          a.date
        );

        const dateB = new Date(
          b.date
        );

        return sort === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });

      return data;
    }, [bookings, status, sort]);

  return (
    <Layout
      title="Facilities"
      breadcrumb={[
        "Resident",
        "Facilities",
      ]}
    >
      <FacilityStats />

      <FacilityFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
      />

      {/* Facilities */}

      <section className="mb-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            Available Facilities
          </h2>

          <span className="text-sm text-slate-500">
            {filteredFacilities.length} Facilities
          </span>
        </div>

        {filteredFacilities.length ===
        0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
            <h3 className="text-xl font-semibold text-slate-700">
              No Facilities Found
            </h3>

            <p className="mt-2 text-slate-500">
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredFacilities.map(
              (facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onBook={
                    setSelectedFacility
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      {/* Booking History */}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            My Bookings
          </h2>

          <span className="text-sm text-slate-500">
            {filteredBookings.length}{" "}
            Booking(s)
          </span>
        </div>

        <BookingHistory
          bookings={filteredBookings}
          onView={setSelectedBooking}
        />
      </section>

      {/* Booking Modal */}

      <Modal
        open={!!selectedFacility}
        title="Book Facility"
        onClose={() =>
          setSelectedFacility(null)
        }
      >
        {selectedFacility && (
          <FacilityBookingForm
            facility={
              selectedFacility
            }
            onClose={() =>
              setSelectedFacility(
                null
              )
            }
          />
        )}
      </Modal>

      {/* Details Modal */}

      <BookingDetails
        booking={selectedBooking}
        onClose={() =>
          setSelectedBooking(null)
        }
      />
    </Layout>
  );
};

export default Facilities;