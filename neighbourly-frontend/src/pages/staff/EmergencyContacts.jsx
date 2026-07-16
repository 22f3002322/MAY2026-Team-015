import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import EmptyState from "../../components/empty/EmptyState";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import { toast } from "sonner";
import { Phone, Plus, Trash2, ShieldAlert } from "lucide-react";

const EmergencyContacts = () => {
  const { emergencyContacts, addEmergencyContact, deleteEmergencyContact } = useStaffDashboardStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Emergency");

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please fill in name and phone number.");
      return;
    }

    addEmergencyContact({ name, phone, category });
    toast.success("Contact added successfully!");
    setIsAddModalOpen(false);

    setName("");
    setPhone("");
    setCategory("Emergency");
  };

  const handleDelete = (id) => {
    deleteEmergencyContact(id);
    toast.success("Contact deleted successfully!");
  };

  const groupedContacts = useMemo(() => {
    const groups = {
      Emergency: [],
      Management: [],
      Maintenance: []
    };
    emergencyContacts.forEach(contact => {
      const cat = contact.category || "Emergency";
      if (groups[cat]) {
        groups[cat].push(contact);
      } else {
        groups["Emergency"].push(contact);
      }
    });
    return groups;
  }, [emergencyContacts]);

  return (
    <Layout title="Emergency Contacts" breadcrumb={["Staff", "Emergency Contacts"]}>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
            <Plus size={18} /> Add Contact
          </Button>
        </div>

        {emergencyContacts.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Contacts Available"
            description="Create emergency or management contacts for staff accessibility."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Object.keys(groupedContacts).map((groupName) => (
              <Card key={groupName} title={`${groupName} Directory`} subtitle={`Important ${groupName.toLowerCase()} contacts`}>
                {groupedContacts[groupName].length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-2">No contacts registered under this category.</p>
                ) : (
                  <div className="space-y-3.5 mt-2">
                    {groupedContacts[groupName].map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{contact.name}</h4>
                          <a href={`tel:${contact.phone}`} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5 block flex items-center gap-1 font-medium">
                            <Phone size={12} /> {contact.phone}
                          </a>
                        </div>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          aria-label="Delete contact"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          open={isAddModalOpen}
          title="Add Emergency Contact"
          onClose={() => setIsAddModalOpen(false)}
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddContact}>Add Contact</Button>
            </div>
          }
        >
          <form className="space-y-4" onSubmit={handleAddContact}>
            <Input
              label="Contact Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fire Station, Society Manager"
              required
            />
            <Input
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 101, +91 98765 43210"
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none focus:border-indigo-600 dark:focus:border-indigo-500"
              >
                <option value="Emergency">Emergency</option>
                <option value="Management">Management</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default EmergencyContacts;
