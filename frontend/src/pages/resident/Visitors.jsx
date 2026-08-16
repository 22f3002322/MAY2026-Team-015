import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";

import Layout from "../../components/layout/Layout";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

import VisitorStats from "../../components/residents/visitors/VisitorStats";
import VisitorFilters from "../../components/residents/visitors/VisitorFilters";
import VisitorTable from "../../components/residents/visitors/VisitorTable";
import VisitorForm from "../../components/residents/visitors/VisitorForm";
import VisitorDetails from "../../components/residents/visitors/VisitorDetails";

import useVisitorStore from "../../store/visitorStore";
import useResidentStore from "../../store/residentStore";
import useAuthStore from "../../store/authStore";

const Visitors = () => {
  const { user, isVerified } = useAuthStore();
  // Zustand
  const visitors = useVisitorStore(
    (state) => state.visitors
  );
  
  const resident = useResidentStore(
    (state) => state.residents[0]
  );

  const addVisitor = useVisitorStore(
    (state) => state.addVisitor
  );

  const fetchVisitorRequests = useVisitorStore(
    (state) => state.fetchVisitorRequests
  );

  useEffect(() => {
    fetchVisitorRequests();
  }, [fetchVisitorRequests]);

  // Filters

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  // Modals

  const [openModal, setOpenModal] =
    useState(false);

  const [
    selectedVisitor,
    setSelectedVisitor,
  ] = useState(null);



  // Filtering

  const filteredVisitors =
    useMemo(() => {
      return visitors.filter(
        (visitor) => {
          const matchesSearch =
            visitor.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            visitor.phone?.includes(
              search
            );

          const matchesStatus =
            status === "" ||
            visitor.status === status;

          const matchesPurpose =
            purpose === "" ||
            visitor.purpose ===
              purpose;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesPurpose
          );
        }
      );
    }, [
      visitors,
      search,
      status,
      purpose,
    ]);

  return (
    <Layout
      title="Visitors"
      breadcrumb={[
        "Resident",
        "Visitors",
      ]}
    >
      <VisitorStats />

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        purpose={purpose}
        setPurpose={setPurpose}
        onAddVisitor={() => {
          const userIsVerified = isVerified !== false && user?.isVerified !== false;
          if (!userIsVerified) {
            toast.error("Your account must be verified by the Committee to register visitors.");
            return;
          }
          setOpenModal(true);
        }}
      />

      <Card
        title="My Visitors"
        subtitle="Manage your visitor requests"
      >
        <VisitorTable
          visitors={filteredVisitors}
          onView={setSelectedVisitor}
        />
      </Card>
      {/* Add Visitor */}

      <Modal
        open={openModal}
        title="Add Visitor"
        onClose={() =>
          setOpenModal(false)
        }
      >
        <VisitorForm
          onSubmit={async (data) => {
            const res = await addVisitor({
              ...data,
              residentFlat: resident ? resident.flat : "101",
            });
            if (res.success && res.otp) {
              toast.success(`Visitor pre-registered! OTP is ${res.otp}`, { duration: 6000 });
            }
            setOpenModal(false);
          }}
          onClose={() =>
            setOpenModal(false)
          }
        />
      </Modal>

      {/* Visitor Details */}

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() =>
          setSelectedVisitor(null)
        }
      />
    </Layout>
  );
};

export default Visitors;