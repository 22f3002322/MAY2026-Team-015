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
import useAuthStore from "../../store/authStore";

const Visitors = () => {
  const { user, isVerified } = useAuthStore();
  const visitors = useVisitorStore((state) => state.visitors);
  const addVisitor = useVisitorStore((state) => state.addVisitor);
  const denyVisitor = useVisitorStore((state) => state.denyVisitor);
  const fetchVisitorRequests = useVisitorStore(
    (state) => state.fetchVisitorRequests
  );

  useEffect(() => {
    fetchVisitorRequests();
  }, [fetchVisitorRequests]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [purpose, setPurpose] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [denyItem, setDenyItem] = useState(null);
  /** Plain OTPs from pre-register responses only, keyed by request_id */
  const [plainOtps, setPlainOtps] = useState({});

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const matchesSearch =
        visitor.name?.toLowerCase().includes(search.toLowerCase()) ||
        visitor.phone?.includes(search);

      const matchesStatus =
        status === "" ||
        visitor.statusValue === status ||
        visitor.status === status;

      const matchesPurpose =
        purpose === "" || visitor.purpose === purpose;

      return matchesSearch && matchesStatus && matchesPurpose;
    });
  }, [visitors, search, status, purpose]);

  const userIsVerified = isVerified === true && user?.isVerified !== false;

  return (
    <Layout title="Visitors" breadcrumb={["Resident", "Visitors"]}>
      <VisitorStats visitors={visitors} />

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        purpose={purpose}
        setPurpose={setPurpose}
        onAddVisitor={() => {
          if (!userIsVerified) {
            toast.error(
              "Your account must be verified by the Committee to register visitors."
            );
            return;
          }
          setOpenModal(true);
        }}
      />

      <Card title="My Visitors" subtitle="Manage your visitor requests">
        <VisitorTable
          visitors={filteredVisitors}
          onView={(v) =>
            setSelectedVisitor({
              ...v,
              otp: plainOtps[v.id] || null,
            })
          }
          onDeny={setDenyItem}
        />
      </Card>

      <Modal
        open={openModal}
        title="Add Visitor"
        onClose={() => setOpenModal(false)}
      >
        <VisitorForm
          flatLabel={
            user?.flat
              ? `${user.block ? `${user.block} · ` : ""}${user.flat}`
              : null
          }
          onSubmit={async (data) => {
            const res = await addVisitor(data);
            if (res?.success) {
              const requestId = res.data?.request_id;
              if (res.otp && requestId) {
                setPlainOtps((prev) => ({ ...prev, [requestId]: res.otp }));
                toast.success(`Visitor pre-registered! OTP: ${res.otp}`, {
                  duration: 8000,
                });
              } else {
                toast.success(res.message || "Visitor pre-registered.");
              }
              setOpenModal(false);
            } else {
              toast.error(res?.message || "Failed to register visitor.");
            }
          }}
          onClose={() => setOpenModal(false)}
        />
      </Modal>

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />

      <ConfirmDialog
        open={!!denyItem}
        title="Deny Visitor Request"
        message={`Deny visit for "${denyItem?.name}"? They will not be able to enter with this request.`}
        confirmText="Deny"
        onCancel={() => setDenyItem(null)}
        onConfirm={async () => {
          const res = await denyVisitor(denyItem.id);
          if (res?.success) {
            toast.success(res.message || "Visitor request denied.");
          } else {
            toast.error(res?.message || "Failed to deny request.");
          }
          setDenyItem(null);
        }}
      />
    </Layout>
  );
};

export default Visitors;
