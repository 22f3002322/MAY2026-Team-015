import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import { toast } from "sonner";
import { Search, Plus, Truck, Check, Calendar, User, Home, Package } from "lucide-react";

const DeliveryRegister = () => {
  const { deliveries, addDelivery, updateDelivery } = useStaffDashboardStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const pageSize = 6;

  // Form State
  const [recipientName, setRecipientName] = useState("");
  const [flat, setFlat] = useState("");
  const [type, setType] = useState("Courier");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddDelivery = (e) => {
    e.preventDefault();
    if (!recipientName || !flat || !provider) {
      toast.error("Please fill in all required fields.");
      return;
    }

    addDelivery({
      recipientName,
      flat,
      type,
      provider,
      notes,
      status: "Pending"
    });

    toast.success("Delivery registered successfully!");
    setIsAddModalOpen(false);

    // Reset Form
    setRecipientName("");
    setFlat("");
    setType("Courier");
    setProvider("");
    setNotes("");
  };

  const handleMarkCollected = (id) => {
    updateDelivery(id, { status: "Collected" });
    toast.success("Delivery marked as collected by resident.");
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesSearch = 
        (d.recipientName && d.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.flat && d.flat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.provider && d.provider.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [deliveries, searchTerm, statusFilter]);

  // Pagination calculations
  const totalItems = filteredDeliveries.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDeliveries.slice(start, start + pageSize);
  }, [filteredDeliveries, currentPage]);

  return (
    <Layout title="Delivery Register" breadcrumb={["Staff", "Delivery Register"]}>
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search recipient, flat, courier..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Collection</option>
                <option value="Collected">Collected</option>
              </select>
            </div>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 w-full md:w-auto justify-center">
            <Plus size={18} /> Add Delivery
          </Button>
        </div>

        {/* Deliveries Card Grid */}
        {totalItems === 0 ? (
          <EmptyState
            icon={Package}
            title="No Deliveries Registered"
            description="You can add new deliveries arriving at the gate."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedDeliveries.map((delivery) => (
              <Card key={delivery.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="text-indigo-600 dark:text-indigo-400" size={20} />
                      <h3 className="font-bold text-slate-800 dark:text-white capitalize">{delivery.provider}</h3>
                    </div>
                    <Badge variant={delivery.status === "Collected" ? "success" : "warning"}>
                      {delivery.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User size={15} className="text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{delivery.recipientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home size={15} className="text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Flat {delivery.flat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-slate-400" />
                      <span>{new Date(delivery.createdAt).toLocaleDateString()}</span>
                    </div>
                    {delivery.notes && (
                      <p className="text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-slate-500 italic mt-1">
                        Note: {delivery.notes}
                      </p>
                    )}
                  </div>
                </div>

                {delivery.status === "Pending" && (
                  <Button
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleMarkCollected(delivery.id)}
                  >
                    <Check size={16} /> Mark Collected
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Add Delivery Modal */}
        <Modal
          open={isAddModalOpen}
          title="Register New Delivery"
          onClose={() => setIsAddModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDelivery}>Register Delivery</Button>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleAddDelivery}>
            <Input
              label="Recipient Name *"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. William Alexander"
              required
            />
            <Input
              label="Flat Number *"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              placeholder="e.g. A-101"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="Courier">Courier</option>
                <option value="Food Delivery">Food Delivery</option>
                <option value="Parcel">Parcel</option>
                <option value="Documents">Documents</option>
              </select>
            </div>
            <Input
              label="Courier Provider *"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. Amazon, DHL, Zomato"
              required
            />
            <Input
              label="Additional Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Left with guard, fragile package"
            />
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default DeliveryRegister;
