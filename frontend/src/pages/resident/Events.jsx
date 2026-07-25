import { useMemo, useState } from "react";

import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";

import EventStats from "../../components/residents/events/EventStats";
import EventFilters from "../../components/residents/events/EventFilters";
import EventCard from "../../components/residents/events/EventCard";
import EventDetails from "../../components/residents/events/EventDetails";
import EventRegistrationForm from "../../components/residents/events/EventRegistrationForm";
import MyRegistrations from "../../components/residents/events/MyRegistrationForm";

import useEventStore from "../../store/eventStore";

const Events = () => {
  const events = useEventStore(
    (state) => state.events
  );

  const registrations =
    useEventStore(
      (state) => state.registrations
    );

  const getEventById =
    useEventStore(
      (state) => state.getEventById
    );

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [type, setType] =
    useState("all");

  const [sort, setSort] =
    useState("upcoming");

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState(null);

  const [
    registerEvent,
    setRegisterEvent,
  ] = useState(null);

  const filteredEvents =
    useMemo(() => {
      let data = [...events];

      if (search.trim()) {
        const query =
          search.toLowerCase();

        data = data.filter(
          (event) =>
            event.title
              .toLowerCase()
              .includes(query)
        );
      }

      if (category) {
        data = data.filter(
          (event) =>
            event.category ===
            category
        );
      }

      const today = new Date();

      if (type === "upcoming") {
        data = data.filter(
          (event) =>
            new Date(event.date) >=
            today
        );
      }

      if (type === "past") {
        data = data.filter(
          (event) =>
            new Date(event.date) <
            today
        );
      }

      data.sort((a, b) => {
        const first =
          new Date(a.date);

        const second =
          new Date(b.date);

        return sort ===
          "upcoming"
          ? first - second
          : second - first;
      });

      return data;
    }, [
      events,
      search,
      category,
      type,
      sort,
    ]);

  return (
    <Layout
      title="Community Events"
      breadcrumb={[
        "Resident",
        "Events",
      ]}
    >
      <EventStats />

      <EventFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        type={type}
        setType={setType}
        sort={sort}
        setSort={setSort}
      />

      {/* Events */}

      <section className="mb-12">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Upcoming Events
          </h2>

          <span className="text-sm text-slate-500">
            {filteredEvents.length}
            {" "}Events
          </span>

        </div>

        {filteredEvents.length ===
        0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-20 text-center">

            <h2 className="text-xl font-semibold">
              No Events Found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your
              filters.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredEvents.map(
              (event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={
                    setSelectedEvent
                  }
                  onRegister={
                    setRegisterEvent
                  }
                />
              )
            )}

          </div>
        )}

      </section>

      {/* Registrations */}

      <section>

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            My Registrations
          </h2>

          <span className="text-sm text-slate-500">
            {
              registrations.length
            }{" "}
            Registered
          </span>

        </div>

        <MyRegistrations
          registrations={
            registrations
          }
          onViewEvent={(id) =>
            setSelectedEvent(
              getEventById(id)
            )
          }
        />

      </section>

      {/* Details */}

      <EventDetails
        event={selectedEvent}
        onClose={() =>
          setSelectedEvent(null)
        }
        onRegister={(event) => {
          setSelectedEvent(null);
          setRegisterEvent(event);
        }}
      />

      {/* Register */}

      <Modal
        open={!!registerEvent}
        title="Register Event"
        onClose={() =>
          setRegisterEvent(null)
        }
      >
        {registerEvent && (
          <EventRegistrationForm
            event={registerEvent}
            onClose={() =>
              setRegisterEvent(
                null
              )
            }
          />
        )}
      </Modal>

    </Layout>
  );
};

export default Events;